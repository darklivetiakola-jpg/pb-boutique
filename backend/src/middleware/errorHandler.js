/**
 * Gestionnaire d'erreurs centralisé. En production, ne renvoie jamais la
 * stack trace ni les détails internes (évite de fuiter la structure du code
 * ou des messages de la base de données à un attaquant).
 */
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  res.status(status).json({
    error: isProd && status === 500 ? "Une erreur est survenue." : err.message,
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: "Route introuvable." });
}
