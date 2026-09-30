# Mise en ligne — guide pas à pas

## 0. Audit des fichiers .env (à lire en premier)

| # | Constat | Gravité | Action |
|---|---------|---------|--------|
| 1 | `backend/.env` contient l'URL Neon **avec le mot de passe en clair** (elle a été partagée dans un zip) | Critique | Neon → Roles → *Reset password*, puis utiliser la nouvelle URL. |
| 2 | Les secrets JWT (64 caractères) ont aussi été partagés | Haute | Les régénérer pour la production (commande ci-dessous). |
| 3 | `NODE_ENV=development` | Haute | Mettre `production` sur l'hébergeur (active les cookies `secure` et la validation au démarrage). |
| 4 | `FRONTEND_URL` / `ADMIN_URL` = localhost | Haute | Le CORS bloquerait tout : mettre les vraies URL https. |
| 5 | `CINETPAY_RETURN_URL` = `/merci.html` (ancienne page) | Haute | La route Vue est `/confirmation`. |
| 6 | `CINETPAY_API_KEY` / `SITE_ID` = valeurs factices | Haute | Sans vraies clés, aucun paiement ne fonctionne. |
| 7 | `CINETPAY_NOTIFY_URL` = localhost | Haute | CinetPay doit joindre une URL publique https (`/api/orders/webhook`). |
| 8 | Cookies `sameSite: lax` figés dans le code | Haute | Corrigé : réglables via `COOKIE_SAMESITE` / `COOKIE_DOMAIN`. Domaine commun recommandé. |
| 9 | `storefront/.env.example` et `admin/.env` absents ; `VITE_API_URL` non défini pour la boutique | Moyenne | Ajoutés. Les variables `VITE_*` sont figées **au build** : à définir sur Vercel/Netlify avant de déployer. |
| 10 | CORS acceptait l'origine `"null"` | Moyenne | Corrigé : refusée en production. |
| 11 | `GOOGLE_CLIENT_ID` | Info | Public, pas secret. Ajouter les domaines de production dans Google Cloud → Origines JavaScript autorisées. |
| 12 | Aucun dossier `prisma/migrations` dans le zip | Moyenne | `start:prod` utilise `prisma db push` (adapté à une base neuve). |
| 13 | Images téléversées sur disque | Moyenne | Sans volume persistant, elles disparaissent à chaque redéploiement (voir étape 2). |

Générer un secret : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (deux fois, valeurs différentes).

## 1. Base de données (Neon)
1. Réinitialiser le mot de passe du rôle `neondb_owner`. 2. Copier la nouvelle `DATABASE_URL`.

## 2. API (Render ou Railway) — dossier `backend`
- Build : `npm install` — Start : `npm run start:prod` — Health check : `/api/health`.
- Variables : voir `backend/.env.production.example`.
- **Images** : Render → ajouter un *Disk* monté sur `/var/data/uploads` et `UPLOAD_DIR=/var/data/uploads` (voir `render.yaml`). Sinon, migrer vers Cloudinary.
- Premier lancement : ouvrir le shell et exécuter `npm run seed` (crée l'admin et les données) — **changer immédiatement le mot de passe admin**.

## 3. Boutique et admin (Vercel ou Netlify)
- Boutique : dossier `storefront`, build `npm run build`, sortie `dist`, variables `.env.production.example`.
- Admin : dossier `admin`, même principe, `VITE_API_URL` requis.
- Les redirections SPA (`vercel.json`, `public/_redirects`) sont incluses.

## 4. Domaines (important pour la connexion)
Utiliser un domaine commun : `www.mondomaine.ci` (boutique), `admin.mondomaine.ci`, `api.mondomaine.ci`, avec `COOKIE_DOMAIN=.mondomaine.ci`. Avec des domaines différents, Safari (iPhone) bloque les cookies et la connexion échoue.

## 5. Liste de contrôle avant ouverture
- [ ] Mot de passe Neon changé, nouveaux secrets JWT
- [ ] `GET https://api.mondomaine.ci/api/health` répond `ok`
- [ ] Connexion admin, création d'un produit avec photo, visible sur la boutique
- [ ] Test de commande CinetPay en mode test, puis réel
- [ ] Domaines ajoutés dans Google Cloud
- [ ] Numéro WhatsApp réel dans `storefront/src/App.vue` (actuellement `2250700000000`)
