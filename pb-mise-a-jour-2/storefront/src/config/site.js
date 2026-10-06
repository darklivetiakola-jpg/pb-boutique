// ─────────────────────────────────────────────────────────────
//  Coordonnées de la boutique — UN SEUL endroit à modifier.
//  Laisser une valeur vide ("") masque automatiquement le lien.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: "PB Boutique Hommes",
  whatsapp: "2250556650614",            // format international, sans « + » ni espaces
  phoneDisplay: "+225 05 56 65 06 14",  // affiché dans le pied de page
  facebook: "https://www.facebook.com/share/1D7j4Z8aLo/?mibextid=wwXIfr",
  instagram: "",                        // ex. "https://instagram.com/pbboutique" (vide = masqué)
  tiktok: "",                           // ex. "https://tiktok.com/@pbboutique"  (vide = masqué)
  email: "",                            // ex. "contact@votredomaine.ci"        (vide = masqué)
  hours: "Lun–Sam · 8h – 20h",
};

/** Lien WhatsApp avec message pré-rempli (optionnel). */
export const waLink = (text) => `https://wa.me/${SITE.whatsapp}` + (text ? `?text=${encodeURIComponent(text)}` : "");
