import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env, allowedOrigins } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import uploadsRoutes, { UPLOAD_DIR } from "./routes/uploads.routes.js";

export const app = express();

// Le webhook CinetPay a besoin du corps brut (raw) pour vérifier la
// signature — il doit être monté AVANT express.json() global.
app.use("/api/orders/webhook", express.raw({ type: "*/*" }));

app.set("trust proxy", 1); // nécessaire derrière Railway/Render pour un rate-limit correct par IP

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = env.nodeEnv === "production" ? allowedOrigins : [...allowedOrigins, "null"];
    // origin est undefined pour les requêtes sans en-tête Origin (curl, apps mobiles) — sans risque à autoriser
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error("Origine non autorisée par CORS."));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Limite globale anti-DoS basique (les routes sensibles ont leur propre limite plus stricte)
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Images téléversées depuis l'admin (accessibles par la boutique et l'admin)
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "30d", immutable: true }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/uploads", uploadsRoutes);

app.use(notFound);
app.use(errorHandler);
