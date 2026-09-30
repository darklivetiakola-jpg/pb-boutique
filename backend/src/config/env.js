import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5500",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",
  // Origines autorisées (CORS). Plusieurs valeurs possibles, séparées par des virgules.
  cookie: {
    // "lax" si boutique + API partagent le même domaine parent (recommandé), "none" sinon.
    sameSite: (process.env.COOKIE_SAMESITE || "lax").toLowerCase(),
    domain: process.env.COOKIE_DOMAIN || undefined, // ex: .mondomaine.ci
    secure: (process.env.NODE_ENV === "production") || (process.env.COOKIE_SAMESITE || "").toLowerCase() === "none",
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  cinetpay: {
    apiKey: process.env.CINETPAY_API_KEY || "",
    siteId: process.env.CINETPAY_SITE_ID || "",
    baseUrl: process.env.CINETPAY_BASE_URL || "https://api-checkout.cinetpay.com/v2",
    notifyUrl: process.env.CINETPAY_NOTIFY_URL || "",
    returnUrl: process.env.CINETPAY_RETURN_URL || "",
  },
};

export const allowedOrigins = [env.frontendUrl, env.adminUrl]
  .flatMap(v => String(v).split(",")).map(v => v.trim().replace(/\/$/, "")).filter(Boolean);

export const cookieOptions = (extra = {}) => ({
  httpOnly: true, secure: env.cookie.secure, sameSite: env.cookie.sameSite,
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}), ...extra,
});

if (env.nodeEnv === "production") {
  for (const k of ["jwt.accessSecret", "jwt.refreshSecret"]) {
    const v = k.split(".").reduce((o, x) => o?.[x], env);
    if (v && v.length < 32) throw new Error(`${k} trop court (32 caractères minimum).`);
  }
  if (allowedOrigins.some(o => o.includes("localhost"))) console.warn("⚠️  FRONTEND_URL / ADMIN_URL pointent encore vers localhost : le CORS bloquera la boutique en ligne.");
  if (!env.cinetpay.apiKey || env.cinetpay.apiKey.startsWith("your")) console.warn("⚠️  CINETPAY_API_KEY absent : les paiements ne fonctionneront pas.");
  const required = ["databaseUrl", "jwt.accessSecret", "jwt.refreshSecret"];
  for (const path of required) {
    const value = path.split(".").reduce((o, k) => o?.[k], env);
    if (!value) throw new Error(`Variable d'environnement manquante pour: ${path}`);
  }
}
