import { cookieOptions } from "../config/env.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
import { prisma } from "../utils/prisma.js";

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires }
  );
}

export async function issueRefreshToken(user) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token, userId: user.id, expiresAt } });
  return token;
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("pb_access_token", accessToken, cookieOptions({ maxAge: 15 * 60 * 1000 }));
  if (refreshToken) {
    res.cookie("pb_refresh_token", refreshToken, cookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000, path: "/api/auth/refresh" }));
  }
}

export function clearAuthCookies(res) {
  res.clearCookie("pb_access_token", cookieOptions());
  res.clearCookie("pb_refresh_token", cookieOptions({ path: "/api/auth/refresh" }));
}
