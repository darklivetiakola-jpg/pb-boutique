// Généré/piloté par scripts/set-image.mjs — ne pas mettre d'URL en dur dans les vues.
import manifest from "./images.json";
const FALLBACK = "/logo.png";
export const img = (slot) => {
  const m = manifest[slot];
  return m ? `/images/${m.file}?v=${m.v}` : FALLBACK;
};
export const IMG = new Proxy({}, { get: (_, slot) => img(String(slot).replace(/_/g, "-")) });
