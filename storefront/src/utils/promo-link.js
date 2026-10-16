import { RouterLink } from "vue-router";
// Lien interne (/categorie/polos) -> router-link ; lien externe (https://…) -> <a>
export const isExt = (u) => /^https?:\/\//i.test(u || "");
export const linkTag = (u) => (isExt(u) ? "a" : RouterLink);
export const linkProps = (u) => (isExt(u) ? { href: u, target: "_blank", rel: "noopener" } : { to: u || "/" });
