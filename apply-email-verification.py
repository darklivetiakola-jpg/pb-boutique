#!/usr/bin/env python3
"""Vérification de l'email à l'inscription (code à 6 chiffres envoyé par email).
 - Le compte n'est créé qu'APRÈS validation du code (aucun faux compte en base).
 - Aucune modification du schéma Prisma : la table temporaire est créée automatiquement.
 - Connexion : l'email n'est plus sensible à la casse (Jean@x.com = jean@x.com).
Usage (racine du projet) : python3 apply-email-verification.py — idempotent."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True
def rd(rel): return (ROOT / rel).read_text(encoding="utf8")
def wr(rel, s):
    p = ROOT / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(s, encoding="utf8")

def create(rel, content):
    p = ROOT / rel
    if p.exists() and p.read_text(encoding="utf8") == content: print(f"= déjà fait  {rel}"); return
    wr(rel, content); print(f"✔ {rel} (créé/mis à jour)")

def edit(rel, name, marker, old, new):
    global ok
    s = rd(rel)
    if marker in s: print(f"= déjà fait  {rel} :: {name}"); return
    if old not in s: print(f"✖ ANCRE INTROUVABLE  {rel} :: {name}"); ok = False; return
    wr(rel, s.replace(old, new, 1)); print(f"✔ {rel} :: {name}")

# ============================ BACKEND ============================
create("backend/src/services/mail.service.js", r'''// Envoi d'emails via une API HTTP (Resend ou Brevo). Render gratuit bloque le SMTP, donc pas de Gmail/SMTP.
// Variables : RESEND_API_KEY  ou  BREVO_API_KEY ;  MAIL_FROM (adresse expéditrice) ;  MAIL_FROM_NAME (facultatif)
const fail = (status, message) => Object.assign(new Error(message), { status });

export function mailProvider() {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.BREVO_API_KEY) return "brevo";
  return null;
}

export async function sendMail({ to, subject, html, text }) {
  const provider = mailProvider();
  const from = process.env.MAIL_FROM || "";
  const fromName = process.env.MAIL_FROM_NAME || "PB Boutique Hommes";

  if (!provider || !from) {
    if (process.env.NODE_ENV === "production") {
      console.error("[mail] Non configuré : définir RESEND_API_KEY (ou BREVO_API_KEY) et MAIL_FROM sur Render.");
      throw fail(503, "La vérification par email n'est pas encore disponible. Réessayez plus tard ou contactez la boutique.");
    }
    console.log(`\n[mail:dev] À : ${to}\n[mail:dev] Sujet : ${subject}\n${text}\n`);
    return;
  }

  let res;
  try {
    if (provider === "resend") {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${fromName} <${from}>`, to: [to], subject, html, text }),
        signal: AbortSignal.timeout(10000),
      });
    } else {
      res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: fromName, email: from }, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (e) {
    console.error(`[mail] ${provider} injoignable :`, e.message);
    throw fail(502, "Impossible d'envoyer l'email pour le moment. Réessayez dans un instant.");
  }
  if (!res.ok) {
    console.error(`[mail] ${provider} a refusé l'envoi (${res.status}) :`, (await res.text()).slice(0, 400));
    throw fail(502, "Impossible d'envoyer l'email pour le moment. Réessayez dans un instant.");
  }
}
''')

create("backend/src/services/signup.service.js", r'''import crypto from "crypto";
import { prisma } from "../utils/prisma.js";
import { sendMail } from "./mail.service.js";

// Inscription en 2 temps : les données restent dans "PendingSignup" jusqu'à validation du code reçu par email.
// La table est créée automatiquement au premier usage (aucune migration Prisma à lancer).
const CODE_TTL_MIN = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_S = 60; // (les durées sont aussi écrites en dur dans le SQL ci-dessous : 15 minutes / 60 secondes)
export const CODE_TTL_MINUTES = CODE_TTL_MIN;

const fail = (status, message) => Object.assign(new Error(message), { status });

let tableReady = null;
function ensureTable() {
  if (!tableReady) {
    tableReady = prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "PendingSignup" (
      "email" TEXT PRIMARY KEY,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "phone" TEXT,
      "passwordHash" TEXT NOT NULL,
      "codeHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "lastSentAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`.catch((e) => { tableReady = null; throw e; });
  }
  return tableReady;
}

const newCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const hashCode = (email, code) =>
  crypto.createHmac("sha256", process.env.JWT_ACCESS_SECRET || "dev-secret").update(`${email}:${code}`).digest("hex");
const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

function emailContent(firstName, code) {
  const name = firstName || "";
  const text = `Bonjour ${name},\n\nVotre code de vérification PB Boutique Hommes : ${code}\nIl est valable ${CODE_TTL_MIN} minutes.\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.`;
  const html = `<!doctype html><html><body style="margin:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">
    <div style="background:#111;border-radius:16px;padding:28px;text-align:center;color:#fff;">
      <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#D4A62A;">PB Boutique Hommes</div>
      <h1 style="margin:14px 0 6px;font-size:22px;">Bonjour ${name.replace(/[<>&"]/g, "")} 👋</h1>
      <p style="margin:0 0 20px;color:#bbb;font-size:15px;">Voici votre code pour activer votre compte :</p>
      <div style="display:inline-block;background:#D4A62A;color:#111;font-size:34px;font-weight:700;letter-spacing:10px;padding:14px 22px 14px 32px;border-radius:12px;">${code}</div>
      <p style="margin:20px 0 0;color:#999;font-size:13px;">Valable ${CODE_TTL_MIN} minutes.</p>
    </div>
    <p style="color:#777;font-size:12px;text-align:center;margin-top:16px;">Vous n'avez pas demandé ce code ? Ignorez simplement cet email.</p>
  </div></body></html>`;
  return { text, html };
}

async function sendCode(email, firstName, code) {
  const { text, html } = emailContent(firstName, code);
  await sendMail({ to: email, subject: `${code} est votre code PB Boutique Hommes`, html, text });
}

/** Enregistre (ou remplace) l'inscription en attente et envoie le code. */
export async function startSignup({ email, firstName, lastName, phone, passwordHash }) {
  await ensureTable();
  await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "expiresAt" < now() - interval '1 day'`;
  const rows = await prisma.$queryRaw`SELECT (now() - "lastSentAt") < interval '60 seconds' AS recent FROM "PendingSignup" WHERE "email" = ${email}`;
  if (rows[0]?.recent) throw fail(429, "Un code vient d'être envoyé. Patientez une minute avant de réessayer.");

  const code = newCode();
  const codeHash = hashCode(email, code);
  await prisma.$executeRaw`INSERT INTO "PendingSignup" ("email","firstName","lastName","phone","passwordHash","codeHash","expiresAt","attempts","lastSentAt")
    VALUES (${email}, ${firstName}, ${lastName}, ${phone}, ${passwordHash}, ${codeHash}, now() + interval '15 minutes', 0, now())
    ON CONFLICT ("email") DO UPDATE SET "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName", "phone" = EXCLUDED."phone",
      "passwordHash" = EXCLUDED."passwordHash", "codeHash" = EXCLUDED."codeHash", "expiresAt" = EXCLUDED."expiresAt", "attempts" = 0, "lastSentAt" = now()`;
  try { await sendCode(email, firstName, code); }
  catch (e) { await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "email" = ${email}`; throw e; }
}

/** Vérifie le code. Renvoie les données d'inscription si valide (le contrôleur crée alors le compte). */
export async function verifySignup(email, code) {
  await ensureTable();
  const rows = await prisma.$queryRaw`UPDATE "PendingSignup" SET "attempts" = "attempts" + 1 WHERE "email" = ${email}
    RETURNING "firstName","lastName","phone","passwordHash","codeHash","attempts", ("expiresAt" < now()) AS "expired"`;
  const row = rows[0];
  if (!row) throw fail(400, "Aucune inscription en attente pour cet email. Recommencez l'inscription.");
  if (row.attempts > MAX_ATTEMPTS) throw fail(429, "Trop d'essais. Demandez un nouveau code.");
  if (row.expired) throw fail(400, "Ce code a expiré. Demandez-en un nouveau.");
  if (!safeEqual(row.codeHash, hashCode(email, code))) {
    const left = MAX_ATTEMPTS - row.attempts;
    throw fail(400, left > 0 ? `Code incorrect. Il vous reste ${left} essai${left > 1 ? "s" : ""}.` : "Code incorrect. Demandez un nouveau code.");
  }
  return { firstName: row.firstName, lastName: row.lastName, phone: row.phone, passwordHash: row.passwordHash };
}

export async function discardSignup(email) {
  await ensureTable();
  await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "email" = ${email}`;
}

/** Renvoie un nouveau code (60 s minimum entre deux envois). */
export async function resendSignup(email) {
  await ensureTable();
  const rows = await prisma.$queryRaw`SELECT "firstName", (now() - "lastSentAt") < interval '60 seconds' AS recent FROM "PendingSignup" WHERE "email" = ${email}`;
  const row = rows[0];
  if (!row) throw fail(400, "Aucune inscription en attente pour cet email. Recommencez l'inscription.");
  if (row.recent) throw fail(429, "Un code vient d'être envoyé. Patientez une minute avant d'en demander un autre.");
  const code = newCode();
  await prisma.$executeRaw`UPDATE "PendingSignup" SET "codeHash" = ${hashCode(email, code)}, "expiresAt" = now() + interval '15 minutes', "attempts" = 0, "lastSentAt" = now() WHERE "email" = ${email}`;
  await sendCode(email, row.firstName, code);
}
''')

C = "backend/src/controllers/auth.controller.js"
s = rd(C)
if "verifyEmail" in s: print(f"= déjà fait  {C}")
else:
    pat = re.compile(r"export async function register\(req, res\) \{.*?\n\}\n\nexport async function login", re.S)
    if not pat.search(s): print(f"✖ ANCRE INTROUVABLE  {C} :: register"); ok = False
    else:
        NEW = '''function signupError(e, res) {
  if (e && e.status) return res.status(e.status).json({ error: e.message });
  throw e;
}

/** Étape 1 : on enregistre l'inscription en attente et on envoie un code par email (le compte n'existe pas encore). */
export async function register(req, res) {
  const { firstName, lastName, password, phone } = req.body;
  const email = req.body.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet email." });

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await startSignup({ email, firstName, lastName, phone: phone || null, passwordHash });
  } catch (e) { return signupError(e, res); }
  res.status(202).json({ needsVerification: true, email, expiresInMinutes: CODE_TTL_MINUTES });
}

/** Étape 2 : le client saisit le code reçu → le compte est créé et il est connecté. */
export async function verifyEmail(req, res) {
  const email = req.body.email.trim().toLowerCase();
  let pending;
  try { pending = await verifySignup(email, req.body.code); } catch (e) { return signupError(e, res); }

  let user;
  try {
    user = await prisma.user.create({
      data: { firstName: pending.firstName, lastName: pending.lastName, email, passwordHash: pending.passwordHash, phone: pending.phone },
    });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    throw e;
  }
  await discardSignup(email);

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json(publicUser(user));
}

export async function resendCode(req, res) {
  const email = req.body.email.trim().toLowerCase();
  try { await resendSignup(email); } catch (e) { return signupError(e, res); }
  res.json({ ok: true, expiresInMinutes: CODE_TTL_MINUTES });
}

export async function login'''
        s = pat.sub(lambda m: NEW, s, count=1)
        s = s.replace('import { signAccessToken,', 'import { startSignup, verifySignup, discardSignup, resendSignup, CODE_TTL_MINUTES } from "../services/signup.service.js";\nimport { signAccessToken,', 1)
        wr(C, s); print(f"✔ {C} :: inscription en 2 étapes")
edit(C, "connexion insensible à la casse", 'mode: "insensitive" } } });\n\n  // Message',
     "  const user = await prisma.user.findUnique({ where: { email } });\n\n  // Message volontairement",
     '  const user = await prisma.user.findFirst({ where: { email: { equals: String(email).trim(), mode: "insensitive" } } });\n\n  // Message volontairement')

V = "backend/src/validators/auth.validator.js"
if "verifyEmailSchema" in rd(V): print(f"= déjà fait  {V}")
else:
    wr(V, rd(V).rstrip("\n") + '''

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\\d{6}$/, "Le code contient 6 chiffres"),
});

export const resendCodeSchema = z.object({ email: z.string().email() });
'''); print(f"✔ {V}")

R = "backend/src/routes/auth.routes.js"
edit(R, "import contrôleur", "verifyEmail, resendCode",
     "import { register, login,", "import { verifyEmail, resendCode, register, login,")
edit(R, "import schémas", "verifyEmailSchema",
     "import { registerSchema,", "import { verifyEmailSchema, resendCodeSchema, registerSchema,")
edit(R, "routes", "/verify-email",
     'router.post("/register", validateBody(registerSchema), register);',
     '''const signupLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: { error: "Trop de tentatives, réessayez dans quelques minutes." }, standardHeaders: true, legacyHeaders: false });
router.post("/register", signupLimiter, validateBody(registerSchema), register);
router.post("/verify-email", signupLimiter, validateBody(verifyEmailSchema), verifyEmail);
router.post("/resend-code", signupLimiter, validateBody(resendCodeSchema), resendCode);''')

E = "backend/.env.production.example"
if (ROOT / E).exists() and "MAIL_FROM" not in rd(E):
    wr(E, rd(E).rstrip("\n") + '''

# Vérification de l'email à l'inscription (choisir UN fournisseur : Resend OU Brevo)
RESEND_API_KEY=
# BREVO_API_KEY=
MAIL_FROM=noreply@votredomaine.ci
MAIL_FROM_NAME=PB Boutique Hommes
'''); print(f"✔ {E}")

# ============================ BOUTIQUE ============================
edit("storefront/src/stores/auth.js", "store", "verifyEmail(",
'''    async register(payload) {
      const { data } = await apiClient.post("/auth/register", payload);
      this.user = data; return data;
    },''',
'''    async register(payload) {
      const { data } = await apiClient.post("/auth/register", payload);
      if (!data.needsVerification) this.user = data;   // sinon : il faut d'abord saisir le code reçu par email
      return data;
    },
    async verifyEmail(email, code) {
      const { data } = await apiClient.post("/auth/verify-email", { email, code });
      this.user = data; return data;
    },
    async resendCode(email) {
      const { data } = await apiClient.post("/auth/resend-code", { email });
      return data;
    },''')

A = "storefront/src/views/Account.vue"
edit(A, "titre", "Vérifiez votre email.",
     '<h1>{{ tab === "login" ? "Bon retour." : "Créer un compte." }}</h1>',
     '<h1>{{ tab === "login" ? "Bon retour." : verify.active ? "Vérifiez votre email." : "Créer un compte." }}</h1>')
edit(A, "sous-titre", "Dernière étape",
     ': "Un compte pour commander plus vite et suivre vos livraisons." }}',
     ': verify.active ? "Dernière étape : entrez le code reçu pour activer votre compte." : "Un compte pour commander plus vite et suivre vos livraisons." }}')
edit(A, "masquer Google pendant la vérification", "v-show=\"!(tab === 'register' && verify.active)\"",
     '<div class="gbtn"><div ref="googleBtn"></div></div>\n      <div class="or"><span>ou avec votre email</span></div>',
     '<div class="gbtn" v-show="!(tab === \'register\' && verify.active)"><div ref="googleBtn"></div></div>\n      <div class="or" v-show="!(tab === \'register\' && verify.active)"><span>ou avec votre email</span></div>')
edit(A, "formulaire d'inscription", 'v-else-if="!verify.active"',
     '<form v-else class="form" @submit.prevent="doRegister" novalidate>',
     '<form v-else-if="!verify.active" class="form" @submit.prevent="doRegister" novalidate>')
edit(A, "formulaire du code", "@submit.prevent=\"doVerify\"",
     '      </form>\n\n      <p class="trust">',
     '''      </form>

      <form v-else class="form" @submit.prevent="doVerify" novalidate>
        <div class="banner ok"><i class="fa-solid fa-envelope"></i><span>Un code à 6 chiffres a été envoyé à <b>{{ verify.email }}</b>. Pensez à vérifier vos spams.</span></div>
        <label class="fld"><span>Code de vérification</span>
          <input v-model.trim="verify.code" class="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" placeholder="••••••" required /></label>
        <button class="cta" :disabled="busy || verify.code.length !== 6">{{ busy ? "Vérification…" : "Valider mon compte" }}</button>
        <div class="vlinks">
          <button type="button" class="linkbtn" :disabled="verify.cooldown > 0 || busy" @click="doResend">{{ verify.cooldown > 0 ? `Renvoyer le code (${verify.cooldown}s)` : "Renvoyer le code" }}</button>
          <button type="button" class="linkbtn" @click="cancelVerify">Changer d'email</button>
        </div>
      </form>

      <p class="trust">''')
edit(A, "état", "const verify = reactive",
     'const registerForm = reactive({ firstName: "", lastName: "", email: "", phone: "", password: "" });',
     'const registerForm = reactive({ firstName: "", lastName: "", email: "", phone: "", password: "" });\nconst verify = reactive({ active: false, email: "", code: "", cooldown: 0 });\nlet cdTimer = null;')
edit(A, "appel inscription", "startVerify(r.email",
     'try { await auth.register({ ...registerForm, phone: registerForm.phone || undefined }); await loadOrders(); afterAuth(); }',
     '''try {
    const r = await auth.register({ ...registerForm, phone: registerForm.phone || undefined });
    if (r && r.needsVerification) startVerify(r.email || registerForm.email);
    else { await loadOrders(); afterAuth(); }
  }''')
edit(A, "fonctions de vérification", "async function doVerify",
     'async function doLogout() {',
     '''function startCooldown(sec = 60) {
  clearInterval(cdTimer); verify.cooldown = sec;
  cdTimer = setInterval(() => { verify.cooldown = Math.max(0, verify.cooldown - 1); if (!verify.cooldown) clearInterval(cdTimer); }, 1000);
}
function startVerify(email) { verify.active = true; verify.email = email; verify.code = ""; startCooldown(60); }
function cancelVerify() { clearInterval(cdTimer); verify.active = false; verify.code = ""; verify.cooldown = 0; error.value = ""; }
async function doVerify() {
  error.value = ""; busy.value = true;
  try {
    await auth.verifyEmail(verify.email, verify.code);
    clearInterval(cdTimer); verify.active = false; verify.code = "";
    toast.show("Compte activé, bienvenue !");
    await loadOrders(); afterAuth();
  } catch (e) { error.value = apiError(e, "Code incorrect."); }
  finally { busy.value = false; }
}
async function doResend() {
  error.value = ""; busy.value = true;
  try { await auth.resendCode(verify.email); startCooldown(60); toast.show("Nouveau code envoyé"); }
  catch (e) { error.value = apiError(e, "Envoi impossible pour le moment."); }
  finally { busy.value = false; }
}
async function doLogout() {''')
# nettoyage du minuteur
s = rd(A)
if "clearInterval(cdTimer)); " not in s and "onBeforeUnmount(() => clearInterval(cdTimer))" not in s:
    m = re.search(r'import \{([^}]*)\} from "vue";', s)
    if m:
        names = [n.strip() for n in m.group(1).split(",") if n.strip()]
        if "onBeforeUnmount" not in names:
            s = s.replace(m.group(0), 'import { ' + ", ".join(names + ["onBeforeUnmount"]) + ' } from "vue";', 1)
        s = s.replace("async function doLogout() {", "onBeforeUnmount(() => clearInterval(cdTimer));\nasync function doLogout() {", 1)
        wr(A, s); print(f"✔ {A} :: nettoyage du minuteur")
    else: print(f"✖ import vue introuvable dans {A}"); ok = False
else: print(f"= déjà fait  {A} :: nettoyage du minuteur")
edit(A, "styles", ".fld input.code",
     '.cta:active { transform: scale(.98); } .cta:disabled { opacity: .6; }',
     '''.cta:active { transform: scale(.98); } .cta:disabled { opacity: .6; }
.fld input.code { text-align: center; letter-spacing: .45em; font-size: 1.6rem; font-weight: 700; height: 60px; padding-left: .45em; }
.vlinks { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.linkbtn { background: none; border: 0; padding: 8px 4px; color: var(--ink2); text-decoration: underline; font-size: .88rem; cursor: pointer; }
.linkbtn:disabled { opacity: .5; text-decoration: none; cursor: default; }''')

print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖ (voir ci-dessus)"))
sys.exit(0 if ok else 1)
