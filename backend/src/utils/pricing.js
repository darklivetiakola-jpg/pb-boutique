// Prix effectif d'un produit : le prix flash s'applique tant que la vente flash n'est pas terminée.
export function flashActive(p, now = new Date()) {
  return !!(p.flashPrice && p.flashPrice > 0 && p.flashPrice < p.basePrice && p.flashEndsAt && new Date(p.flashEndsAt) > now);
}
export const priceOf = (p, now = new Date()) => (flashActive(p, now) ? p.flashPrice : p.basePrice);
