import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)
def write(p, content):
    f = pathlib.Path(p); f.parent.mkdir(parents=True, exist_ok=True); f.write_text(content); print("écrit      " + p)

FOOTER = '<template>\n  <footer class="footer" :class="{ open }">\n    <div class="container">\n      <!-- Barre compacte, toujours visible -->\n      <div class="fc-bar">\n        <div class="fc-brand"><img src="/logo.png" alt="PB Boutique Hommes" /></div>\n        <div class="foot-socials">\n          <a href="#" class="soc" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>\n          <a href="#" class="soc" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>\n          <a href="#" class="soc" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>\n          <a href="https://wa.me/2250700000000" target="_blank" rel="noopener" class="soc" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>\n        </div>\n        <button class="fc-toggle" type="button" :aria-expanded="open" aria-controls="foot-more" @click="open = !open">\n          {{ open ? "Réduire" : "Plus d’informations" }} <i class="fa-solid fa-chevron-down" :class="{ rot: open }"></i>\n        </button>\n      </div>\n\n      <!-- Détails : repliés par défaut sur téléphone, toujours visibles sur ordinateur -->\n      <div id="foot-more" class="fc-more" :class="{ on: open }">\n        <div class="fc-inner">\n          <div class="footer-grid">\n            <div class="foot-col">\n              <h4>Catégories</h4>\n              <ul>\n                <li><router-link to="/categorie/chemises">Chemises</router-link></li>\n                <li><router-link to="/categorie/polos">Polos</router-link></li>\n                <li><router-link to="/categorie/costumes">Costumes &amp; Blazers</router-link></li>\n                <li><router-link to="/categorie/pantalons">Pantalons</router-link></li>\n                <li><router-link to="/categorie/accessoires">Accessoires</router-link></li>\n                <li><router-link to="/categorie/nouveautes">Nouveautés</router-link></li>\n              </ul>\n            </div>\n            <div class="foot-col">\n              <h4>Aide</h4>\n              <ul>\n                <li><router-link to="/compte">Mon compte</router-link></li>\n                <li><a href="#">Suivi de commande</a></li>\n                <li><a href="#">Comment payer</a></li>\n                <li><a href="#">Zones de livraison</a></li>\n                <li><a href="#">Retours</a></li>\n                <li><a href="#">FAQ</a></li>\n              </ul>\n            </div>\n            <div class="foot-contact">\n              <h4>Contact</h4>\n              <p><i class="fa-brands fa-whatsapp"></i>+225 07 00 00 00 00</p>\n              <p><i class="fa-solid fa-envelope"></i>contact@pbboutique.ci</p>\n              <p><i class="fa-solid fa-location-dot"></i>Abidjan, Côte d\'Ivoire</p>\n              <p><i class="fa-solid fa-clock"></i>Lun–Sam · 8h – 20h</p>\n              <div class="foot-payments"><span>Wave</span><span>Orange Money</span><span>MTN</span><span>Moov</span><span>Visa</span></div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class="footer-bottom">\n        <span>© 2026 PB Boutique Hommes</span>\n        <div class="foot-legal"><a href="#">Mentions légales</a><a href="#">CGV</a><a href="#">Confidentialité</a></div>\n      </div>\n    </div>\n  </footer>\n</template>\n\n<script setup>\nimport { ref } from "vue";\nconst open = ref(false);\n</script>\n'
LIGHTCSS = '/* =====================================================================\n   THÈME CLAIR "grande enseigne" — blanc, noir profond, touche d\'or du logo.\n   Chargé en dernier. Le noir reste pour l\'en-tête, le pied de page et les boutons d\'achat.\n   ===================================================================== */\n[data-theme="light"] {\n  --bg: #FFFFFF; --bg2: #F5F5F5; --surface: #FFFFFF;\n  --border: #E5E5E5; --border2: #CFCFCF;\n  --ink: #111111; --ink2: #5E5E5E; --ink3: #8D8D8D; --ink-inv: #FFFFFF;\n  --link: #8C6A0E;\n  --shadow-1: 0 1px 2px rgba(0, 0, 0, .05); --shadow-2: 0 8px 24px rgba(0, 0, 0, .08); --shadow-3: 0 20px 48px rgba(0, 0, 0, .14);\n}\n[data-theme="light"] body { background: #fff; }\n[data-theme="light"] h1, [data-theme="light"] h2, [data-theme="light"] .sec-title { font-weight: 800; letter-spacing: -0.045em; }\n\n/* Boutons : noir franc, l\'or apparaît au survol */\n[data-theme="light"] .btn-primary { background: #111; color: #fff; }\n[data-theme="light"] .btn-primary:hover { background: #D4A62A; color: #111; }\n[data-theme="light"] .btn-ghost { border-color: #111; color: #111; }\n[data-theme="light"] .btn-ghost:hover { background: #111; color: #fff; }\n\n/* Produits : image nette, coins discrets, étiquettes noir & or */\n[data-theme="light"] .prod-card-img { border-radius: 12px; background: #F5F5F5; box-shadow: none; }\n[data-theme="light"] .prod-name { font-weight: 600; }\n[data-theme="light"] .filter-chip.active { background: #111; color: #E6BB4E; border-color: #111; }\n\n/* Pages construites en mode sombre : variantes claires lisibles */\n[data-theme="light"] .acc .back { color: #8C6A0E; }\n[data-theme="light"] .acc .chip.ok { background: #E6F6EC; color: #137A3F; }\n[data-theme="light"] .acc .chip.warn { background: #FFF3D6; color: #8C6A0E; }\n[data-theme="light"] .acc .chip.bad { background: #FDE8E8; color: #C62828; }\n[data-theme="light"] .acc .banner.ok { background: #E6F6EC; color: #137A3F; }\n[data-theme="light"] .acc .banner.bad { background: #FDE8E8; color: #C62828; }\n[data-theme="light"] .acc .cta { background: #111; color: #fff; }\n[data-theme="light"] .acc .cta.ghost { background: #fff; color: #111; border-color: #E5E5E5; }\n[data-theme="light"] .acc .seg button.on { box-shadow: 0 1px 4px rgba(0, 0, 0, .12); }\n[data-theme="light"] .pdx .kicker { color: #8C6A0E; }\n[data-theme="light"] .pdx .price em { background: #FFF3D6; color: #8C6A0E; }\n[data-theme="light"] .pdx .sz-h small { color: #C62828; }\n[data-theme="light"] .pdx .sz-row button.on { background: #111; border-color: #111; color: #fff; }\n[data-theme="light"] .pdx .buy .cta { background: #111; color: #fff; }\n[data-theme="light"] .pdx .buy .cta.ok { background: #30D158; color: #06260f; }\n[data-theme="light"] .cartp-bar-m { background: rgba(255, 255, 255, .9); border-color: rgba(0, 0, 0, .08); box-shadow: 0 12px 34px rgba(0, 0, 0, .16); }\n[data-theme="light"] .cartp-bar-m .btn { background: #111; color: #fff; }\n[data-theme="light"] .ios-tabs .ti { color: #6B6B6B; }\n[data-theme="light"] .ios-tabs .ti.on { color: #7A5C0B; }\n[data-theme="light"] .ios-tabs svg.filled { fill: rgba(212, 166, 42, .35); }\n[data-theme="light"] .ios-tabs .bdg { box-shadow: 0 0 0 2px #fff; }\n\n/* Menu mobile : plus de bandeau d\'annonce, il démarre sous l\'en-tête */\n.mmenu { padding-top: calc(var(--header-h) + 20px); }\n\n/* =====================================================================\n   PIED DE PAGE REPLIABLE (toutes thèmes)\n   ===================================================================== */\n.footer { padding: 26px 0 20px; }\n.fc-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }\n.fc-brand img { height: 44px; width: auto; display: block; border-radius: 6px; }\n.fc-bar .foot-socials { display: flex; gap: 8px; }\n.fc-toggle { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 99px; border: 1px solid #2c2c31; color: #E6BB4E; background: transparent; font-weight: 600; font-size: .85rem; transition: background .2s; }\n.fc-toggle:hover { background: rgba(212, 166, 42, .1); }\n.fc-toggle i { font-size: .72rem; transition: transform .3s; } .fc-toggle i.rot { transform: rotate(180deg); }\n.fc-more { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .38s ease; }\n.fc-more.on { grid-template-rows: 1fr; }\n.fc-inner { overflow: hidden; min-height: 0; }\n.fc-more .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 26px 20px; padding: 28px 0 8px; }\n.fc-more .foot-contact { grid-column: 1 / -1; }\n.footer-bottom { margin-top: 18px; padding-top: 14px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }\n@media (max-width: 899px) { .fc-bar { justify-content: space-between; } .fc-toggle { width: 100%; justify-content: center; order: 3; } }\n@media (min-width: 900px) {\n  .fc-toggle { display: none; }\n  .fc-more { grid-template-rows: 1fr; }\n  .fc-more .footer-grid { grid-template-columns: 1fr 1fr 1.4fr; gap: 40px; padding-top: 32px; }\n  .fc-more .foot-contact { grid-column: auto; }\n}\n@media (prefers-reduced-motion: reduce) { .fc-more { transition: none; } }\n'

# 1) Pied de page repliable (barre compacte + « Plus d'informations »)
write("storefront/src/components/SiteFooter.vue", FOOTER)

# 2) Thème clair « grande enseigne » + styles du pied de page
write("storefront/src/assets/light-nike.css", LIGHTCSS)
def main(s):
    if "light-nike.css" in s: return s
    return s.replace('import "./assets/ios-mobile.css";', 'import "./assets/ios-mobile.css";\nimport "./assets/light-nike.css";', 1)
rw("storefront/src/main.js", main)

# 3) Clair par défaut (le sombre reste un choix dans Profil > Apparence)
def index(s):
    s = re.sub(r'<html lang="fr"[^>]*>', '<html lang="fr" data-theme="light">', s, count=1)
    s = s.replace('<meta name="color-scheme" content="dark" />', '<meta name="color-scheme" content="light" />')
    return s
rw("storefront/index.html", index)
def app(s):
    return s.replace('localStorage.getItem("pb_theme") === "light" ? "light" : "dark"; // sombre par défaut',
                     'localStorage.getItem("pb_theme") === "dark" ? "dark" : "light"; // clair par défaut')
rw("storefront/src/App.vue", app)
def account(s):
    s = s.replace('const theme = ref(localStorage.getItem("pb_theme") || "dark");', 'const theme = ref(localStorage.getItem("pb_theme") || "light");')
    s = s.replace("Le mode sombre est le thème d’origine de la boutique. Le mode clair est disponible mais moins travaillé.", "Le mode clair est le thème par défaut. Le mode sombre reste disponible.")
    return s
rw("storefront/src/views/Account.vue", account)

# 4) Plus de bandeau « Livraison en 48h… » en haut
def header(s):
    return re.sub(r'[ \t]*<div class="announce">.*?</div>\n', "", s, count=1, flags=re.S)
rw("storefront/src/components/SiteHeader.vue", header)

# 5) Catégories : une image à la fois, défilement vertical automatique, le client peut faire défiler lui-même
VS_MARKUP = """<div class="vs-wrap" aria-label="Nos catégories">
          <div class="vs" ref="vsEl" @scroll.passive="onVs" @pointerdown="pauseVs" @wheel.passive="pauseVs" @touchstart.passive="pauseVs">
            <router-link v-for="(c, i) in cats" :key="c.slug" :to="`/categorie/${c.slug}`" class="vs-tile">
              <span class="vs-bg" :style="{ backgroundImage: `url('${c.img}')` }"></span>
              <span class="vs-shade"></span>
              <span class="vs-info">
                <em>{{ String(i + 1).padStart(2, "0") }} / {{ String(cats.length).padStart(2, "0") }}</em>
                <b>{{ c.name }}</b>
                <small>{{ c.tags }}</small>
                <span class="vs-cta">Découvrir <i class="fa-solid fa-arrow-right"></i></span>
              </span>
            </router-link>
          </div>
          <div class="vs-dots" aria-hidden="true"><i v-for="(c, i) in cats" :key="c.slug" :class="{ on: i === vsIdx }"></i></div>
        </div>"""
VS_SCRIPT = """const vsEl = ref(null), vsIdx = ref(0);
let vsTimer = null, vsPausedUntil = 0;
const isMobile = () => window.innerWidth < 900;
const tileH = () => { const el = vsEl.value; return el && el.firstElementChild ? el.firstElementChild.offsetHeight + 12 : 1; };
const onVs = () => { const el = vsEl.value; if (el) vsIdx.value = Math.round(el.scrollTop / tileH()); };
const pauseVs = () => { vsPausedUntil = Date.now() + 9000; };   // le client reprend la main : l'auto-défilement attend 9 s
function nextVs() {
  const el = vsEl.value;
  if (!el || !isMobile() || document.hidden || Date.now() < vsPausedUntil) return;
  const next = (vsIdx.value + 1) % cats.length;
  el.scrollTo({ top: next * tileH(), behavior: "smooth" });
}
onMounted(() => { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) vsTimer = setInterval(nextVs, 3800); });
onBeforeUnmount(() => clearInterval(vsTimer));"""
VS_STYLE = """<style>
/* Catégories : une grande image à la fois (défilement vertical automatique sur téléphone), le client peut faire défiler librement */
.vs-wrap { position: relative; }
.vs { display: flex; flex-direction: column; gap: 12px; height: min(74svh, 560px); overflow-y: auto; scroll-snap-type: y mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; border-radius: 16px; }
.vs::-webkit-scrollbar { display: none; }
.vs-tile { position: relative; display: block; flex: 0 0 min(66svh, 470px); scroll-snap-align: start; border-radius: 16px; overflow: hidden; background: #151517; }
.vs-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .7s; }
.vs-tile:hover .vs-bg { transform: scale(1.04); }
.vs-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 35%, rgba(0,0,0,.78)); }
.vs-info { position: absolute; left: 20px; right: 20px; bottom: 22px; display: grid; gap: 4px; color: #fff; }
.vs-info em { font-style: normal; font-size: .76rem; letter-spacing: .08em; color: #E6BB4E; font-weight: 700; }
.vs-info b { font-size: clamp(1.9rem, 8vw, 2.4rem); font-weight: 800; letter-spacing: -0.045em; line-height: 1.02; }
.vs-info small { color: rgba(255,255,255,.75); font-size: .86rem; }
.vs-cta { margin-top: 12px; justify-self: start; display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 99px; background: #fff; color: #111; font-weight: 700; font-size: .88rem; }
.vs-dots { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 6px; z-index: 2; pointer-events: none; }
.vs-dots i { width: 5px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.55); transition: height .25s, background .25s; }
.vs-dots i.on { height: 20px; background: #fff; }
@media (min-width: 900px) {
  .vs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; height: auto; overflow: visible; scroll-snap-type: none; }
  .vs-tile { flex: none; aspect-ratio: 4 / 5; } .vs-dots { display: none; }
}
</style>"""

def home(s):
    if 'class="vs-wrap"' in s: return s
    s = re.sub(r'<div class="vm" aria-label="Nos catégories">.*?</router-link>\s*</div>\s*</div>\s*</div>\s*</div>', lambda m: VS_MARKUP, s, count=1, flags=re.S)
    s = re.sub(r"const nCols = ref\(.*?onBeforeUnmount\(\(\) => window\.removeEventListener\(\"resize\", onResize\)\);", lambda m: VS_SCRIPT, s, count=1, flags=re.S)
    s = re.sub(r"<style>\s*/\* Catégories : colonnes qui défilent.*?</style>", lambda m: VS_STYLE, s, count=1, flags=re.S)
    return s
rw("storefront/src/views/Home.vue", home)
