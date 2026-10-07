import crypto from "crypto";
import { prisma } from "../utils/prisma.js";
import { sendMail } from "./mail.service.js";

// Inscription en 2 temps : les données restent dans "PendingSignup" jusqu'à validation du code reçu par email.
// La table est créée automatiquement au premier usage (aucune migration Prisma à lancer).
const CODE_TTL_MIN = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_S = 60; // (les durées sont aussi écrites en dur dans le SQL ci-dessous : 15 minutes / 60 secondes)
export const CODE_TTL_MINUTES = CODE_TTL_MIN;

const fail = (status, message) => Object.assign(new Error(message), { status });

let tableReady = null;
function ensureTable() {
  if (!tableReady) {
    tableReady = prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "PendingSignup" (
      "email" TEXT PRIMARY KEY,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "phone" TEXT,
      "passwordHash" TEXT NOT NULL,
      "codeHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "lastSentAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`.catch((e) => { tableReady = null; throw e; });
  }
  return tableReady;
}

const newCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const hashCode = (email, code) =>
  crypto.createHmac("sha256", process.env.JWT_ACCESS_SECRET || "dev-secret").update(`${email}:${code}`).digest("hex");
const safeEqual = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

function emailContent(firstName, code) {
  const name = firstName || "";
  const text = `Bonjour ${name},\n\nVotre code de vérification PB Boutique Hommes : ${code}\nIl est valable ${CODE_TTL_MIN} minutes.\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.`;
  const html = `<!doctype html><html><body style="margin:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">
    <div style="background:#111;border-radius:16px;padding:28px;text-align:center;color:#fff;">
      <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#D4A62A;">PB Boutique Hommes</div>
      <h1 style="margin:14px 0 6px;font-size:22px;">Bonjour ${name.replace(/[<>&"]/g, "")} 👋</h1>
      <p style="margin:0 0 20px;color:#bbb;font-size:15px;">Voici votre code pour activer votre compte :</p>
      <div style="display:inline-block;background:#D4A62A;color:#111;font-size:34px;font-weight:700;letter-spacing:10px;padding:14px 22px 14px 32px;border-radius:12px;">${code}</div>
      <p style="margin:20px 0 0;color:#999;font-size:13px;">Valable ${CODE_TTL_MIN} minutes.</p>
    </div>
    <p style="color:#777;font-size:12px;text-align:center;margin-top:16px;">Vous n'avez pas demandé ce code ? Ignorez simplement cet email.</p>
  </div></body></html>`;
  return { text, html };
}

async function sendCode(email, firstName, code) {
  const { text, html } = emailContent(firstName, code);
  await sendMail({ to: email, subject: `${code} est votre code PB Boutique Hommes`, html, text });
}

/** Enregistre (ou remplace) l'inscription en attente et envoie le code. */
export async function startSignup({ email, firstName, lastName, phone, passwordHash }) {
  await ensureTable();
  await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "expiresAt" < now() - interval '1 day'`;
  const rows = await prisma.$queryRaw`SELECT (now() - "lastSentAt") < interval '60 seconds' AS recent FROM "PendingSignup" WHERE "email" = ${email}`;
  if (rows[0]?.recent) throw fail(429, "Un code vient d'être envoyé. Patientez une minute avant de réessayer.");

  const code = newCode();
  const codeHash = hashCode(email, code);
  await prisma.$executeRaw`INSERT INTO "PendingSignup" ("email","firstName","lastName","phone","passwordHash","codeHash","expiresAt","attempts","lastSentAt")
    VALUES (${email}, ${firstName}, ${lastName}, ${phone}, ${passwordHash}, ${codeHash}, now() + interval '15 minutes', 0, now())
    ON CONFLICT ("email") DO UPDATE SET "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName", "phone" = EXCLUDED."phone",
      "passwordHash" = EXCLUDED."passwordHash", "codeHash" = EXCLUDED."codeHash", "expiresAt" = EXCLUDED."expiresAt", "attempts" = 0, "lastSentAt" = now()`;
  try { await sendCode(email, firstName, code); }
  catch (e) { await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "email" = ${email}`; throw e; }
}

/** Vérifie le code. Renvoie les données d'inscription si valide (le contrôleur crée alors le compte). */
export async function verifySignup(email, code) {
  await ensureTable();
  const rows = await prisma.$queryRaw`UPDATE "PendingSignup" SET "attempts" = "attempts" + 1 WHERE "email" = ${email}
    RETURNING "firstName","lastName","phone","passwordHash","codeHash","attempts", ("expiresAt" < now()) AS "expired"`;
  const row = rows[0];
  if (!row) throw fail(400, "Aucune inscription en attente pour cet email. Recommencez l'inscription.");
  if (row.attempts > MAX_ATTEMPTS) throw fail(429, "Trop d'essais. Demandez un nouveau code.");
  if (row.expired) throw fail(400, "Ce code a expiré. Demandez-en un nouveau.");
  if (!safeEqual(row.codeHash, hashCode(email, code))) {
    const left = MAX_ATTEMPTS - row.attempts;
    throw fail(400, left > 0 ? `Code incorrect. Il vous reste ${left} essai${left > 1 ? "s" : ""}.` : "Code incorrect. Demandez un nouveau code.");
  }
  return { firstName: row.firstName, lastName: row.lastName, phone: row.phone, passwordHash: row.passwordHash };
}

export async function discardSignup(email) {
  await ensureTable();
  await prisma.$executeRaw`DELETE FROM "PendingSignup" WHERE "email" = ${email}`;
}

/** Renvoie un nouveau code (60 s minimum entre deux envois). */
export async function resendSignup(email) {
  await ensureTable();
  const rows = await prisma.$queryRaw`SELECT "firstName", (now() - "lastSentAt") < interval '60 seconds' AS recent FROM "PendingSignup" WHERE "email" = ${email}`;
  const row = rows[0];
  if (!row) throw fail(400, "Aucune inscription en attente pour cet email. Recommencez l'inscription.");
  if (row.recent) throw fail(429, "Un code vient d'être envoyé. Patientez une minute avant d'en demander un autre.");
  const code = newCode();
  await prisma.$executeRaw`UPDATE "PendingSignup" SET "codeHash" = ${hashCode(email, code)}, "expiresAt" = now() + interval '15 minutes', "attempts" = 0, "lastSentAt" = now() WHERE "email" = ${email}`;
  await sendCode(email, row.firstName, code);
}
