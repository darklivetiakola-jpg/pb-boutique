import re, pathlib, os
def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists(): print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s)
    f.write_text(n); print(("modifié    " if n != s else "déjà ok    ") + p)

HELMET = r'''app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));'''

STATIC = r'''// ---- Sert la boutique (/) et l'admin (/admin) depuis ce même service ----
const ROOT = path.resolve(process.cwd(), "..");
const shopDist = path.join(ROOT, "storefront", "dist");
const adminDist = path.join(ROOT, "admin", "dist");
if (fs.existsSync(adminDist)) {
  app.use("/admin", express.static(adminDist, { maxAge: "1h" }));
  app.get("/admin/*", (req, res) => res.sendFile(path.join(adminDist, "index.html")));
}
if (fs.existsSync(shopDist)) {
  app.use(express.static(shopDist, { maxAge: "1h" }));
  app.get(/^\/(?!api\/|uploads\/|admin(\/|$)).*/, (req, res) => res.sendFile(path.join(shopDist, "index.html")));
}

app.use(notFound);'''

def app_js(s):
    s = re.sub(r'app\.use\(helmet\(\{.*?\n\}\)\);', lambda m: HELMET, s, count=1, flags=re.S)
    for imp in ('import path from "path";', 'import fs from "fs";'):
        if imp not in s:
            s = s.replace('import express from "express";', 'import express from "express";\n' + imp, 1)
    if "Sert la boutique" not in s:
        s = s.replace("app.use(notFound);", STATIC, 1)
    return s
rw("backend/src/app.js", app_js)

open("render-build.sh", "w").write('''#!/usr/bin/env bash
set -e
(cd storefront && npm install --include=dev && npm run build)
(cd admin && npm install --include=dev && npm run build)
(cd backend && npm install)
''')
os.chmod("render-build.sh", 0o755); print("écrit      render-build.sh")

open("admin/vite.config.js", "w").write('''import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/admin/",
  plugins: [vue()],
  server: { port: 5174 },
});
''')
print("écrit      admin/vite.config.js")

rw("admin/src/router/index.js", lambda s: s.replace("createWebHistory()", "createWebHistory(import.meta.env.BASE_URL)"))
rw("admin/src/api/client.js", lambda s: s.replace('window.location.href = "/login";', 'window.location.href = import.meta.env.BASE_URL + "login";'))
def layout(s):
    s = s.replace('<img src="/logo.png"', '<img :src="logo"').replace('href="http://localhost:5500" target="_blank"', 'href="/" target="_blank"')
    if "const logo" not in s:
        s = s.replace('import SideLink from "./SideLink.vue";', 'import SideLink from "./SideLink.vue";\nconst logo = import.meta.env.BASE_URL + "logo.png";', 1)
    return s
rw("admin/src/components/AdminLayout.vue", layout)
def login(s):
    s = s.replace('<img src="/logo.png"', '<img :src="logo"')
    if "const logo" not in s:
        s = s.replace("<script setup>", '<script setup>\nconst logo = import.meta.env.BASE_URL + "logo.png";', 1)
    return s
rw("admin/src/views/Login.vue", login)
