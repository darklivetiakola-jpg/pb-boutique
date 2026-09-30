# PB Boutique Hommes — Projet complet (Node.js + Vue partout)

Boutique en ligne vêtements homme, chic, Abidjan. Stack 100% cohérente
maintenant : backend Node.js, storefront Vue 3, dashboard admin Vue 3.

## Structure

```
storefront/  Site vitrine — Vue 3 + Vite + Vue Router + Pinia (ex site/ en HTML classique)
backend/     API Node.js + Express + PostgreSQL (Prisma)
admin/       Dashboard admin Vue 3 — stats animées, produits, stock, commandes, contenu
```

## Ce qui a changé : migration du site vitrine en Vue 3

Fini les URLs en `.html` — routes propres via Vue Router :

| Avant (HTML)          | Maintenant (Vue)              |
|-----------------------|--------------------------------|
| `index.html`          | `/`                            |
| `chemises.html`       | `/categorie/chemises`          |
| `product.html?id=...` | `/produit/:id`                 |
| `compte.html`         | `/compte`                      |
| `merci.html`          | `/confirmation?ref=...`        |

Le design, les couleurs, les polices, les animations (`.rv`, hero vidéo,
diaporama, etc.) sont **identiques** — j'ai repris la feuille de style
existante telle quelle plutôt que de tout réécrire en classes utilitaires,
pour garantir une fidélité visuelle totale. Le panier reste en
`localStorage` (comportement inchangé), et le compte client (email +
Google Sign-In) fonctionne exactement comme avant.

## Démarrage — dans l'ordre

### 1. Backend (inchangé)
```bash
cd backend
npm install
cp .env.example .env   # ou réutilise ton .env existant + GOOGLE_CLIENT_ID
npx prisma migrate dev --name add_google_auth   # si pas déjà fait
npm run seed            # si pas déjà fait
npm run dev
```

### 2. Storefront (nouveau, remplace `site/`)
```bash
cd storefront
npm install
cp .env.example .env
```
Ouvre `.env` et colle ton Client ID Google dans `VITE_GOOGLE_CLIENT_ID`
(le même que dans `backend/.env`).
```bash
npm run dev
```
`http://localhost:5500` — le port est identique à avant, donc CORS et
Google restent configurés pareil côté backend.

### 3. Admin (inchangé)
```bash
cd admin
npm install
cp .env.example .env
npm run dev
```
`http://localhost:5174`

## Build pour la mise en ligne

`storefront` et `admin` sont maintenant tous les deux des apps Vue — même
commande pour les deux :
```bash
npm run build   # génère dist/ à héberger comme site statique
```

## Sécurité, Google Sign-In, prochaines étapes

Inchangé par rapport à la version précédente — voir les sections
correspondantes envoyées plus tôt (mots de passe bcrypt, JWT httpOnly,
rate-limiting, webhook CinetPay signé, jeton Google vérifié côté serveur).
