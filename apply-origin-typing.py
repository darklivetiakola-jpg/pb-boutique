#!/usr/bin/env python3
"""Section « Fait à Abidjan » de l'accueil : texte posé SUR l'image, écrit automatiquement
(effet machine à écrire, 3 phrases en boucle) avec la police « Bebas Neue » (jeune, streetwear).
Usage (racine du projet) : python3 apply-origin-typing.py — idempotent."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True
def rd(rel): return (ROOT / rel).read_text(encoding="utf8")
def wr(rel, s): (ROOT / rel).write_text(s, encoding="utf8")

# 1) Police : on l'ajoute au lien Google Fonts déjà utilisé pour Inter
s = rd("storefront/index.html")
if "Bebas+Neue" in s: print("= déjà fait  index.html :: police")
elif "family=Inter:" in s:
    wr("storefront/index.html", s.replace("family=Inter:", "family=Bebas+Neue&family=Inter:", 1)); print("✔ index.html :: police Bebas Neue")
else: print("✖ ANCRE INTROUVABLE  index.html :: lien Google Fonts"); ok = False

# 2) Template Home.vue
H = "storefront/src/views/Home.vue"; s = rd(H)
NEW_TPL = '''<div class="origin-wrap" ref="originEl">
          <div class="origin-img"><img :src="img('origin')" alt="PB Boutique Hommes — style frais"/></div>
          <div class="origin-shade"></div>
          <div class="origin-text">
            <div class="origin-kicker"><div class="flag-ci"><span class="f1"></span><span class="f2"></span><span class="f3"></span></div>Fait à Abidjan · Dispo 7j/7</div>
            <h2 class="origin-title" aria-label="Le style frais, cool, sans prise de tête">
              <span class="ot-a" aria-hidden="true">{{ typedA }}<i v-if="typingLine === 0" class="type-caret"></i></span>
              <span class="ot-b" aria-hidden="true">{{ typedB }}<i v-if="typingLine === 1" class="type-caret"></i></span>
            </h2>
            <p class="origin-body">Polos, tee-shirts, chemises… des pièces jeunes et fraîches pour assurer partout, de la fac aux sorties du week-end.</p>
            <div class="origin-stats">
              <div><div class="ostat-num">7j/7</div><div class="ostat-lbl">Boutique ouverte<br/>commande à toute heure</div></div>
              <div><div class="ostat-num">48h</div><div class="ostat-lbl">Livraison<br/>Abidjan</div></div>
              <div><div class="ostat-num">7j</div><div class="ostat-lbl">Échange<br/>gratuit</div></div>
            </div>
            <router-link to="/categorie/nouveautes" class="btn btn-orange">Découvrir <i class="fa-solid fa-arrow-right"></i></router-link>
          </div>
        </div>'''
if "origin-shade" in s: print("= déjà fait  Home.vue :: template")
else:
    pat = re.compile(r'<div class="origin-wrap">.*?<div class="origin-img"><img :src="img\(\'origin\'\)"[^>]*/></div>\s*</div>', re.S)
    if pat.search(s): wr(H, pat.sub(lambda m: NEW_TPL, s, count=1)); print("✔ Home.vue :: template")
    else: print("✖ ANCRE INTROUVABLE  Home.vue :: bloc origin-wrap"); ok = False

# 3) Script Home.vue (machine à écrire)
JS = '''const subscribed = ref(false);

// --- Machine à écrire de la section « Fait à Abidjan » ---
const originEl = ref(null);
const typedA = ref(""), typedB = ref(""), typingLine = ref(0);
const TYPE_PHRASES = [
  ["Le style frais,", "cool, sans prise de tête"],
  ["Dispo 7j/7,", "commande quand tu veux"],
  ["Pour ceux qui", "assurent partout"],
];
let typingAlive = false, typingTimer = null, typingObs = null;
const pause = (ms) => new Promise((r) => { typingTimer = setTimeout(r, ms); });
async function typeInto(target, text, speed) {
  for (let i = 1; i <= text.length && typingAlive; i++) { target.value = text.slice(0, i); await pause(speed + Math.random() * 40); }
}
async function eraseBoth() {
  while (typingAlive && (typedA.value || typedB.value)) {
    if (typedB.value) { typingLine.value = 1; typedB.value = typedB.value.slice(0, -1); }
    else { typingLine.value = 0; typedA.value = typedA.value.slice(0, -1); }
    await pause(22);
  }
}
async function runTyping() {
  typedA.value = ""; typedB.value = "";
  let k = 0;
  while (typingAlive) {
    const [a, b] = TYPE_PHRASES[k % TYPE_PHRASES.length];
    typingLine.value = 0; await typeInto(typedA, a, 70);
    await pause(250); typingLine.value = 1; await typeInto(typedB, b, 70);
    await pause(2600);
    await eraseBoth(); await pause(300); k++;
  }
}
onMounted(() => {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window) || !originEl.value) {
    typedA.value = TYPE_PHRASES[0][0]; typedB.value = TYPE_PHRASES[0][1]; typingLine.value = -1; return;
  }
  typingObs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !typingAlive) { typingAlive = true; runTyping(); }
    else if (!e.isIntersecting && typingAlive) { typingAlive = false; clearTimeout(typingTimer); }
  }, { threshold: 0.35 });
  typingObs.observe(originEl.value);
});
onBeforeUnmount(() => { typingAlive = false; clearTimeout(typingTimer); if (typingObs) typingObs.disconnect(); });'''
s = rd(H)
if "runTyping" in s: print("= déjà fait  Home.vue :: script")
elif "const subscribed = ref(false);" in s: wr(H, s.replace("const subscribed = ref(false);", JS, 1)); print("✔ Home.vue :: script")
else: print("✖ ANCRE INTROUVABLE  Home.vue :: script"); ok = False

# 4) CSS : remplace l'ancienne mise en page « empilée » par la version « texte sur l'image »
CSS = '''/* ORIGIN OVERLAY : texte écrit automatiquement sur l'image */
.origin-wrap { display: block; position: relative; min-height: clamp(540px, 60vw, 640px); }
.origin-img { position: absolute; inset: 0; height: auto; min-height: 0; }
.origin-img img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
.origin-shade { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(8,8,10,.62) 0%, rgba(8,8,10,.50) 45%, rgba(8,8,10,.86) 100%); }
.origin-text { position: relative; z-index: 2; min-height: inherit; justify-content: center; align-items: center; text-align: center; padding: 56px 24px; }
.origin-kicker { justify-content: center; }
.origin-title { font-family: "Bebas Neue", Impact, "Arial Narrow", sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: .02em; line-height: .98; font-size: clamp(2rem, 8.4vw, 5rem); min-height: 2em; margin-bottom: 18px; text-shadow: 0 2px 18px rgba(0,0,0,.45); }
.origin-title .ot-a, .origin-title .ot-b { display: block; min-height: 1em; }
.origin-title .ot-b { color: var(--orange); }
.type-caret { display: inline-block; width: .07em; height: .82em; margin-left: .08em; background: currentColor; vertical-align: -.04em; animation: caretBlink 1s steps(1) infinite; }
@keyframes caretBlink { 50% { opacity: 0; } }
.origin-body { max-width: 520px; margin: 0 auto 26px; color: rgba(255,255,255,.88); }
.origin-stats { justify-content: center; }
.ostat-lbl { color: rgba(255,255,255,.7); }
.origin-text .btn { align-self: center; min-width: 240px; justify-content: center; }
@media (prefers-reduced-motion: reduce) { .type-caret { animation: none; } }'''
C = "storefront/src/assets/styles.css"; s = rd(C)
if "ORIGIN OVERLAY" in s: print("= déjà fait  styles.css")
else:
    pat = re.compile(r'/\* ORIGIN STACKED.*?\.origin-img img \{ object-position: center 35%; \}', re.S)
    s = pat.sub(lambda m: CSS, s, count=1) if pat.search(s) else s.rstrip("\n") + "\n\n" + CSS + "\n"
    wr(C, s); print("✔ styles.css :: mise en page « texte sur l'image »")
print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖"))
sys.exit(0 if ok else 1)
