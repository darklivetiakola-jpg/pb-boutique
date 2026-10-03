import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)

# CAUSE DU BLOCAGE : la fiche produit avait DEUX éléments racine. Avec la transition « out-in » de App.vue,
# quand on quittait cette page, l'animation de sortie ne se terminait jamais : la page suivante n'était plus
# affichée (zone vide, on ne voyait que l'en-tête et le pied de page) jusqu'au rechargement.

# 1) La fiche produit n'a plus qu'une seule racine
def detail(s):
    if 'class="pd-root"' in s: return s
    s = s.replace('<template>\n  <main v-if="p" class="pdx">', '<template>\n  <div class="pd-root">\n  <main v-if="p" class="pdx">', 1)
    s = s.replace('  </main>\n</template>\n\n<script setup>', '  </main>\n  </div>\n</template>\n\n<script setup>', 1)
    return s
rw("storefront/src/views/ProductDetail.vue", detail)

# 2) Transition entre pages plus robuste : plus de mode « out-in » (qui bloque tout si une sortie ne se termine pas)
def app(s):
    s = s.replace('<transition name="page" mode="out-in">', '<transition name="page">')
    s = s.replace(".page-enter-active, .page-leave-active { transition: opacity 0.2s ease; }\n.page-enter-from, .page-leave-to { opacity: 0; }",
                  ".page-enter-active { transition: opacity 0.22s ease; }\n.page-enter-from { opacity: 0; }")
    return s
rw("storefront/src/App.vue", app)
