import { reactive } from "vue";

export const toastState = reactive({ text: "", kind: "ok" });
let timer;

/** Affiche un message court en bas de l'écran (kind : "ok" | "error"). */
export function say(text, kind = "ok") {
  toastState.text = text;
  toastState.kind = kind;
  clearTimeout(timer);
  timer = setTimeout(() => (toastState.text = ""), kind === "error" ? 3800 : 2200);
}

/** Message d'erreur lisible à partir d'une erreur axios. */
export function errMsg(e, fallback = "Une erreur est survenue. Réessayez.") {
  if (!e?.response) return "Pas de connexion. Vérifiez votre réseau.";
  return e.response.data?.error || fallback;
}
