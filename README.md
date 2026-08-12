# OUDAROUR FOOD — Facturation

Application privée de facturation en français pour OUDAROUR FOOD. Elle couvre volontairement un périmètre réduit : produits, factures, historique, paiement, paramètres d’entreprise et documents PDF A4.

## Prérequis

- Node.js 20.9 ou supérieur
- Un projet Neon PostgreSQL

## Installation

1. Créez un projet sur Neon et copiez sa chaîne de connexion PostgreSQL.
2. Copiez `.env.example` vers `.env.local`.
3. Renseignez au minimum :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
AUTH_SECRET="une-cle-secrete-longue-et-aleatoire"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Ne placez jamais `DATABASE_URL` dans une variable commençant par `NEXT_PUBLIC_`.

4. Installez et initialisez :

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.

## Migrations de production

```bash
npm run db:generate
npm run db:migrate
```

Les migrations SQL générées sont conservées dans `drizzle/`. Utilisez `db:push` comme raccourci en développement et les migrations versionnées en production.

## Compte initial

Le seed crée un compte administrateur. Par défaut :

- Email : `admin@oudarour.local`
- Mot de passe : `ChangezMoi123!`

Définissez `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` dans `.env.local` avant le seed pour choisir d’autres identifiants. Changez toujours le mot de passe par défaut.

## Commandes

- `npm run dev` : développement
- `npm run build` : compilation de production
- `npm run start` : serveur de production
- `npm run lint` : contrôle ESLint
- `npm run typecheck` : contrôle TypeScript
- `npm run db:generate` : générer une migration
- `npm run db:migrate` : appliquer les migrations
- `npm run db:push` : synchroniser le schéma en développement
- `npm run db:studio` : ouvrir Drizzle Studio
- `npm run db:seed` : créer l’entreprise, l’administrateur et les produits d’exemple

## Sécurité et exactitude

Les pages privées vérifient la session côté serveur. Toutes les mutations sont validées avec Zod. Les accès Neon restent côté serveur. Lors de l’enregistrement, les totaux sont recalculés avec `decimal.js`, la numérotation est incrémentée dans la transaction PostgreSQL, et les lignes conservent un instantané du produit pour protéger l’historique.
