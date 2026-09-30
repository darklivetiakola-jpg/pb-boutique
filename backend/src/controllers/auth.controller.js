import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../utils/prisma.js";
import { env } from "../config/env.js";
import { signAccessToken, issueRefreshToken, setAuthCookies, clearAuthCookies } from "../services/token.service.js";

const googleClient = new OAuth2Client(env.googleClientId);

function publicUser(user) {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone };
}

export async function register(req, res) {
  const { firstName, lastName, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet email." });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, phone },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(publicUser(user));
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Message volontairement générique (ne pas révéler si l'email existe ou non)
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    if (user && !user.passwordHash) {
      return res.status(401).json({ error: "Ce compte utilise la connexion Google — utilisez ce bouton pour vous connecter." });
    }
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json(publicUser(user));
}

/**
 * Connexion / inscription via Google. Le front envoie le "credential" (un JWT
 * signé par Google) obtenu via Google Identity Services — on le vérifie
 * auprès de Google (jamais on ne fait confiance à un token non vérifié),
 * puis on retrouve ou crée le compte correspondant.
 */
export async function googleAuth(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Jeton Google manquant." });
  if (!env.googleClientId) return res.status(500).json({ error: "Connexion Google non configurée côté serveur." });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: "Jeton Google invalide." });
  }

  const { sub: googleId, email, given_name, family_name } = payload;

  let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
  if (!user) {
    user = await prisma.user.create({
      data: { googleId, email, firstName: given_name || "Client", lastName: family_name || "", passwordHash: null },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId } });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json(publicUser(user));
}

export async function logout(req, res) {
  const token = req.cookies?.pb_refresh_token;
  if (token) await prisma.refreshToken.deleteMany({ where: { token } });
  clearAuthCookies(res);
  res.json({ detail: "Déconnecté." });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json(publicUser(user));
}
