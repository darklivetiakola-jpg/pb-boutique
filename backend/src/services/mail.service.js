// Envoi d'emails via une API HTTP (Resend ou Brevo). Render gratuit bloque le SMTP, donc pas de Gmail/SMTP.
// Variables : RESEND_API_KEY  ou  BREVO_API_KEY ;  MAIL_FROM (adresse expéditrice) ;  MAIL_FROM_NAME (facultatif)
const fail = (status, message) => Object.assign(new Error(message), { status });

export function mailProvider() {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.BREVO_API_KEY) return "brevo";
  return null;
}

export async function sendMail({ to, subject, html, text }) {
  const provider = mailProvider();
  const from = process.env.MAIL_FROM || "";
  const fromName = process.env.MAIL_FROM_NAME || "PB Boutique Hommes";

  if (!provider || !from) {
    if (process.env.NODE_ENV === "production") {
      console.error("[mail] Non configuré : définir RESEND_API_KEY (ou BREVO_API_KEY) et MAIL_FROM sur Render.");
      throw fail(503, "La vérification par email n'est pas encore disponible. Réessayez plus tard ou contactez la boutique.");
    }
    console.log(`\n[mail:dev] À : ${to}\n[mail:dev] Sujet : ${subject}\n${text}\n`);
    return;
  }

  let res;
  try {
    if (provider === "resend") {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${fromName} <${from}>`, to: [to], subject, html, text }),
        signal: AbortSignal.timeout(10000),
      });
    } else {
      res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: fromName, email: from }, to: [{ email: to }], subject, htmlContent: html, textContent: text }),
        signal: AbortSignal.timeout(10000),
      });
    }
  } catch (e) {
    console.error(`[mail] ${provider} injoignable :`, e.message);
    throw fail(502, "Impossible d'envoyer l'email pour le moment. Réessayez dans un instant.");
  }
  if (!res.ok) {
    console.error(`[mail] ${provider} a refusé l'envoi (${res.status}) :`, (await res.text()).slice(0, 400));
    throw fail(502, "Impossible d'envoyer l'email pour le moment. Réessayez dans un instant.");
  }
}
