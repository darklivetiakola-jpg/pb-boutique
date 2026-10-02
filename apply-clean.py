import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)

# 1) Supprime la section « Livraison 48h / Mobile Money / Échange gratuit / Conseil style » de l'accueil
def home(s):
    return re.sub(r"[ \t]*<!-- FEATURE STRIP -->.*?(?=[ \t]*<!-- CATEGORIES -->)", "", s, count=1, flags=re.S)
rw("storefront/src/views/Home.vue", home)

# 2) Mobile : plus d'icônes favoris / panier en haut (elles sont dans la barre d'onglets du bas)
MARK = "/* [mobile] icônes du haut retirées */"
RULE = MARK + """
@media (max-width: 720px) {
  .header-actions a[href="/favoris"], .header-actions .hact-cart { display: none !important; }
}
"""
def css(s):
    return s if MARK in s else s.rstrip("\n") + "\n\n" + RULE
rw("storefront/src/assets/theme.css", css)
