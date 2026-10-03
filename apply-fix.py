import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)

# 1) Avertissement « Blocked aria-hidden… » : la 2e copie des tuiles (boucle du défilement) ne doit pas être
#    cachée aux lecteurs d'écran alors qu'elle peut recevoir le focus. On la marque autrement.
def home(s):
    s = s.replace(""" :aria-hidden="copy === 2 ? 'true' : undefined">""", """ :class="{ dup: copy === 2 }">""")
    s = s.replace('.vm-set[aria-hidden="true"] { display: none; }', '.vm-set.dup { display: none; }')
    return s
rw("storefront/src/views/Home.vue", home)

# 2) Erreur « favicon.ico 404 » : on déclare l'icône du site (boutique + admin)
def icon(s):
    if 'rel="icon"' in s: return s
    return s.replace("<title>", '<link rel="icon" type="image/png" href="/logo.png" />\n    <link rel="apple-touch-icon" href="/logo.png" />\n    <title>', 1)
rw("storefront/index.html", icon)
rw("admin/index.html", icon)
