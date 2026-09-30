/**
 * Valide req.body avec un schéma zod. Rejette toute requête malformée avant
 * qu'elle n'atteigne la logique métier — première ligne de défense contre
 * les injections et les données corrompues.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Requête invalide.",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
