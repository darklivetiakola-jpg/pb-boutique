#!/usr/bin/env python3
"""Section « Fait à Abidjan » de l'accueil : texte jeune/frais (dispo 7j/7) en haut, image en dessous.
Usage (racine du projet) : python3 apply-origin-layout.py — idempotent."""
import sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True

def edit(rel, name, marker, old, new, append=False):
    global ok
    p = ROOT / rel; s = p.read_text(encoding="utf8")
    if marker in s: print(f"= déjà fait  {rel} :: {name}"); return
    if append: s = s.rstrip("\n") + "\n\n" + new + "\n"
    elif old in s: s = s.replace(old, new, 1)
    else: print(f"✖ ANCRE INTROUVABLE  {rel} :: {name}"); ok = False; return
    p.write_text(s, encoding="utf8"); print(f"✔ {rel} :: {name}")

H = "storefront/src/views/Home.vue"
edit(H, "surtitre", "Dispo 7j/7</div>", "</div>Fait à Abidjan</div>", "</div>Fait à Abidjan · Dispo 7j/7</div>")
edit(H, "titre", "sans prise de tête", "La rigueur du<br/><span>tailleur ivoirien</span>", "Le style frais, cool<br/><span>et sans prise de tête</span>")
edit(H, "texte", "de la fac aux sorties",
     "Chaque pièce PB Boutique Hommes est sélectionnée et contrôlée à Abidjan pour son tombé, sa matière et sa tenue dans le temps — pas de compromis sur la qualité.",
     "Polos, tee-shirts, chemises… des pièces jeunes, fraîches et confortables pour assurer partout, de la fac aux sorties du week-end. Pas de prise de tête : la boutique est dispo 7j/7, commande quand tu veux.")
edit(H, "chiffre 7j/7", 'ostat-num">7j/7',
     '<div class="ostat-num">100%</div><div class="ostat-lbl">Contrôle qualité<br/>avant expédition</div>',
     '<div class="ostat-num">7j/7</div><div class="ostat-lbl">Boutique ouverte<br/>commande à toute heure</div>')

edit("storefront/src/assets/styles.css", "mise en page empilée", "ORIGIN STACKED", "", """/* ORIGIN STACKED : texte en haut, image en dessous */
.origin-wrap { display: flex; flex-direction: column; min-height: 0; }
.origin-text { align-items: center; text-align: center; padding: 56px 32px 40px; }
.origin-body { max-width: 560px; margin-left: auto; margin-right: auto; }
.origin-stats { justify-content: center; }
.origin-text .btn { align-self: center; min-width: 240px; justify-content: center; }
.origin-img { height: clamp(260px, 46vw, 540px); min-height: 0; }
.origin-img img { object-position: center 35%; }""", append=True)
print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖"))
sys.exit(0 if ok else 1)
