import re, json, pathlib
def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists(): print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)

# ========== 1) CLOUDINARY (photos persistantes) ==========
UPLOADS = r'''import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

// Si CLOUDINARY_URL est défini, les images vont sur Cloudinary (persistant, gratuit).
const useCloud = Boolean(process.env.CLOUDINARY_URL);
if (!useCloud) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: useCloud
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
      }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error("Format non supporté (JPG, PNG ou WebP).")),
});

const toCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "pb-boutique", resource_type: "image", transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      )
      .end(buffer);
  });

const router = Router();

router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), upload.array("files", 8), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (useCloud) {
      const urls = await Promise.all(files.map((f) => toCloudinary(f.buffer)));
      return res.status(201).json({ urls });
    }
    const base = `${req.protocol}://${req.get("host")}/uploads`;
    res.status(201).json({ urls: files.map((f) => `${base}/${f.filename}`) });
  } catch (e) { next(e); }
});

export default router;
'''
rw("backend/src/routes/uploads.routes.js", lambda s: s if "cloudinary" in s else UPLOADS)

def pkg(s):
    d = json.loads(s)
    d["dependencies"].setdefault("cloudinary", "^2.5.1")
    if "prisma" in d.get("devDependencies", {}):
        d["dependencies"]["prisma"] = d["devDependencies"].pop("prisma")
        if not d["devDependencies"]: del d["devDependencies"]
    d["dependencies"] = dict(sorted(d["dependencies"].items()))
    d["scripts"]["start"] = "node src/server.js"
    d["scripts"]["start:prod"] = "node src/server.js"
    return json.dumps(d, indent=2, ensure_ascii=False) + "\n"
rw("backend/package.json", pkg)

# ========== 2) CHANGEMENT DE MOT DE PASSE ==========
CONTROLLER = r'''
/**
 * Changement de mot de passe (utilisateur connecté).
 * Vérifie l'ancien mot de passe (400 et non 401 : la session reste valide),
 * révoque les autres sessions puis rouvre celle-ci.
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "Compte introuvable." });

  if (user.passwordHash) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: "Le mot de passe actuel est incorrect." });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'ancien." });
    }
  }
  if (newPassword === "ChangeMoi123!") {
    return res.status(400).json({ error: "Choisissez un mot de passe personnel (pas celui de démonstration)." });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);

  setAuthCookies(res, signAccessToken(user), await issueRefreshToken(user));
  res.json({ ok: true });
}
'''
rw("backend/src/controllers/auth.controller.js", lambda s: s if "export async function changePassword" in s else s.rstrip("\n") + "\n" + CONTROLLER)

VALIDATOR = r'''
export const changePasswordSchema = z.object({
  currentPassword: z.string().max(200).optional(),
  newPassword: z.string()
    .min(10, "10 caractères minimum")
    .max(100)
    .regex(/[A-Za-z]/, "Ajoutez au moins une lettre")
    .regex(/\d/, "Ajoutez au moins un chiffre"),
});
'''
rw("backend/src/validators/auth.validator.js", lambda s: s if "changePasswordSchema" in s else s.rstrip("\n") + "\n" + VALIDATOR)

def routes(s):
    if "change-password" in s: return s
    s = s.replace("import { register, login, logout, me, googleAuth }", "import { register, login, logout, me, googleAuth, changePassword }")
    s = s.replace("import { registerSchema, loginSchema }", "import { registerSchema, loginSchema, changePasswordSchema }")
    s = s.replace('router.post("/logout", logout);', '''router.post("/logout", logout);
const passwordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, message: { error: "Trop d'essais, réessayez dans quelques minutes." }, standardHeaders: true, legacyHeaders: false });
router.post("/change-password", requireAuth, passwordLimiter, validateBody(changePasswordSchema), changePassword);''')
    return s
rw("backend/src/routes/auth.routes.js", routes)

CARD = r'''    <div class="card p-6 animate-rise" style="animation-delay:40ms">
      <h2 class="text-lg font-bold mb-1">Changer le mot de passe</h2>
      <p class="text-sm text-muted mb-4">Utilisez au moins 10 caractères, avec des lettres et des chiffres.</p>
      <form @submit.prevent="changePwd" class="space-y-3">
        <div class="relative">
          <input v-model="pwd.current" :type="show ? 'text' : 'password'" autocomplete="current-password" placeholder="Mot de passe actuel" required class="input pr-24" />
          <button type="button" @click="show = !show" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gold font-semibold">{{ show ? "Masquer" : "Afficher" }}</button>
        </div>
        <input v-model="pwd.next" :type="show ? 'text' : 'password'" autocomplete="new-password" placeholder="Nouveau mot de passe" required minlength="10" class="input" />
        <div class="h-1.5 rounded-full bg-line overflow-hidden"><div class="h-full transition-all" :style="{ width: strength.pct + '%', background: strength.color }"></div></div>
        <p class="text-xs text-muted">Force : <b>{{ strength.label }}</b></p>
        <input v-model="pwd.confirm" :type="show ? 'text' : 'password'" autocomplete="new-password" placeholder="Confirmer le nouveau mot de passe" required class="input" />
        <p v-if="msg.text" class="text-sm rounded-xl px-4 py-3" :class="msg.ok ? 'bg-green-50 text-good' : 'bg-red-50 text-bad'">{{ msg.text }}</p>
        <button class="btn-primary w-full" :disabled="busy">{{ busy ? "Enregistrement…" : "Mettre à jour le mot de passe" }}</button>
      </form>
    </div>

'''
SCRIPT = r'''import { ref, reactive, computed } from "vue";
import apiClient from "../api/client";
import { useAuthStore } from "../stores/auth";
import Icon from "../components/Icon.vue";
const auth = useAuthStore();

const pwd = reactive({ current: "", next: "", confirm: "" });
const show = ref(false), busy = ref(false), msg = reactive({ ok: false, text: "" });

const strength = computed(() => {
  const v = pwd.next; let n = 0;
  if (v.length >= 10) n++; if (v.length >= 14) n++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) n++;
  if (/\d/.test(v)) n++; if (/[^A-Za-z0-9]/.test(v)) n++;
  const L = [["Très faible", "#C62828"], ["Faible", "#C62828"], ["Moyen", "#D4A62A"], ["Bon", "#D4A62A"], ["Fort", "#137A3F"], ["Excellent", "#137A3F"]][n];
  return { pct: (n / 5) * 100, label: v ? L[0] : "—", color: L[1] };
});

async function changePwd() {
  msg.text = "";
  if (pwd.next !== pwd.confirm) { msg.ok = false; msg.text = "Les deux mots de passe ne correspondent pas."; return; }
  busy.value = true;
  try {
    await apiClient.post("/auth/change-password", { currentPassword: pwd.current, newPassword: pwd.next });
    msg.ok = true; msg.text = "Mot de passe mis à jour. Les autres appareils ont été déconnectés.";
    pwd.current = pwd.next = pwd.confirm = "";
  } catch (e) {
    const d = e.response?.data;
    msg.ok = false; msg.text = d?.details?.newPassword?.[0] || d?.error || "La mise à jour a échoué. Réessayez.";
  } finally { busy.value = false; }
}'''
def settings(s):
    if "Changer le mot de passe" in s: return s
    marker = '    <div class="card p-6 animate-rise" style="animation-delay:80ms">'
    assert marker in s, "Settings.vue : repère introuvable"
    s = s.replace(marker, CARD + marker, 1)
    old = 'import { useAuthStore } from "../stores/auth";\nimport Icon from "../components/Icon.vue";\nconst auth = useAuthStore();'
    assert old in s, "Settings.vue : bloc script introuvable"
    return s.replace(old, SCRIPT, 1)
rw("admin/src/views/Settings.vue", settings)
