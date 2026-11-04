# CLAUDE.md — Riselyo

> Ce fichier guide la production de l'application **Riselyo**. Le lire **en entier** au début de chaque session, avant toute action.
> Le cahier des charges [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) (vision, écrans, logique métier) est la référence fonctionnelle ; ce fichier en est la traduction technique et le **tableau de bord** du projet.

---

## 0. Suivi du projet (à mettre à jour à chaque fin de session)

### Tableau de bord

| Phase | Statut | Avancement | Critère de passage |
| --- | --- | --- | --- |
| 1 — Socle et suivi de base | 🚧 En cours | 8 / 16 | 7 jours d'usage réel sans bug bloquant |
| 2 — Coach IA et Apple Santé | 🔒 Bloquée | 0 / 13 | Coach jugé utile, coût réel < 1 € sur 2 semaines, import Santé fiable 7 jours |
| 3 — Moteur et bilans | 🔒 Bloquée | 0 / 8 | 3 bilans hebdo d'affilée sans chiffre faux |
| 4 — Finitions | 🔒 Bloquée | 0 / 9 | Lighthouse PWA ≥ 90, audit sécurité et RGPD (sections 11 et 12) validé |

Statuts : ⏳ À démarrer · 🚧 En cours · ✅ Terminée · 🔒 Bloquée (phase précédente non validée).
Le détail des tâches (cases à cocher) est en **section 16**. Les compteurs ci-dessus doivent toujours correspondre aux cases cochées.

### En ce moment

- **Phase en cours** : 1
- **Tâche en cours** : — (1.1 à 1.8 terminées)
- **Prochaine tâche** : 1.9 — Habitudes à 3 paliers + boutons rapides (section 4 du cahier des charges ; les logs d'habitudes existent déjà depuis la 1.8)
- **Bloquants / questions ouvertes** :
  - L'installation sur iPhone ne sera testable qu'après le déploiement (1.16) : il faut une URL en HTTPS.
  - « Maquette v1 » citée par le cahier des charges absente du dépôt : à ajouter dans `docs/` si disponible (utile pour l'écran Aujourd'hui, 1.10).

### Dette technique et problèmes connus

_Format : `- [date] description — impact — piste de correction`._

- [2026-11-04] TypeScript bloqué en 6.0 — typescript-eslint 8 ne supporte pas TS 7 — passer à TS 7 dès que typescript-eslint le supporte.
- [2026-11-04] `overrides.minimatch ^11.0.4` dans `package.json` — corrige une vulnérabilité modérée transitive d'ESLint (outillage de dev) — retirer quand ESLint embarquera minimatch ≥ 11.
- [2026-11-04] `apps/worker` et `packages/shared` pas encore créés — aucun code à y mettre en phase 1 — les créer en 2.1 (les workspaces `apps/*` et `packages/*` sont déjà déclarés).
- [2026-11-04] Le premier commit (`chore`) seul ne passe pas `typecheck` (`apps/web` vide) — aucun impact, corrigé par les deux commits suivants.
- [2026-11-04] `npm audit` : 8 alertes modérées et 2 faibles dans `workbox-build` (glob, minimatch, deepmerge), utilisé seulement au build, rien dans le bundle — la CI n'échoue qu'au niveau haut — surveiller les mises à jour de `vite-plugin-pwa` via Dependabot.
- [2026-11-04] Thème sombre : tokens et variante `dark` prêts, mais aucune bascule encore — prévu en 4.7.
- [2026-11-04] secretlint ne reconnaît que les secrets à format connu (OpenAI, Cloudflare, GitHub, clés privées…) : `ACCESS_CODE` et `HEALTH_TOKEN` (chaînes aléatoires) ne seraient pas détectés — ne jamais les écrire hors de `.dev.vars` (ignoré par git) et `wrangler secret` — envisager une règle `secretlint-rule-pattern` en 2.1.
- [2026-11-04] Repositories créés au fil des tâches (choix validé) : consentements, profil, roue de vie, mesures (écriture seule), habitudes (liste + remplacement des actives), journées et logs d'habitudes (1.8). À ajouter : réglages (1.15)… — `replaceActive` des habitudes ne convient qu'à l'onboarding : la 1.9 devra gérer ajout / désactivation.
- [2026-11-04] Écrans A2 (mesures) et A5 (objectifs) non pré-remplis quand on y revient — les repositories n'exposent pas encore de lecture — ajouter les lectures quand l'onglet Progrès / Profil en aura besoin.
- [2026-11-04] Bundle JS de 313 Ko (102 Ko gzippé) dont Dexie et React Router — sous la cible « < 2 s en 4G » mais à surveiller — découper par route (lazy) si besoin, audit en 4.9.
- [2026-11-04] Libellés du radar petits à 320 px (≈ 8 px) — les notes sont aussi listées en texte sous le radar — revoir avec la maquette ou en 3.3 (onglet Progrès).
- [2026-11-04] CSP `connect-src 'self'` — l'origine du Worker devra y être ajoutée en 2.1 (le test `securityHeaders.test.ts` le rappellera).
- [2026-11-04] Les consentements sont enregistrés mais rien ne les lit encore (IA, Santé, notifications n'existent pas) — chaque fonction concernée (2.2, 2.11, 4.2) devra vérifier `isGranted` avant tout envoi, et la révocation devra stopper le traitement (ex. désabonnement push, purge KV).
- [2026-11-04] Activer « Notifications » ne demande pas encore l'autorisation du navigateur — prévu en 4.2.
- [2026-11-04] Profil minimal (Confidentialité, Besoin d'aide) atteint par un lien « Profil » sur l'accueil — remplacé par la barre d'onglets en 1.10.
- [2026-11-04] Les piliers Mouvement, Alimentation et Écrans ne sont pas encore saisis (minutes, repas, eau, alcool, écran le soir) : le cahier les rattache aux boutons rapides (1.9) et à la montre (2.12), pas aux check-ins — à vérifier quand le score sera calculé (3.1).
- [2026-11-04] Le cahier prévoit un thème sombre pour le check-in du soir — reporté en 4.7 avec le thème sombre automatique.
- [2026-11-04] Les habitudes d'une journée sont repérées par leur modèle (`habitId` = `templateId` dans `habitLogs`) : une seule habitude par modèle — à revoir si la 1.9 autorise des habitudes personnalisées.
- [2026-11-04] `HelpScreen` garde sa propre mise en page au lieu de `PageLayout` — doublon mineur — l'aligner quand on y touchera (1.11).

### Journal des sessions

| Date | Tâches faites | Tests | Commit(s) | Reste à tester sur le téléphone |
| --- | --- | --- | --- | --- |
| 2026-11-04 | 1.1 monorepo et outillage ; 1.2 squelette Clean Architecture (`Result`, `DomainError`, `DayKey`, port `Clock`, `SystemClock`, `FakeClock`, `getCurrentDay`, `container.ts`, test des frontières) | 32 tests, couverture domaine + application 100 % | `c9cb27b`, `b4dc70c`, `498e901` | Rien (pas encore d'interface) |
| 2026-11-04 | 1.3 PWA installable : Vite 8, React 18, Tailwind 4, manifest FR, icônes, service worker (hors ligne vérifié serveur coupé), Inter auto-hébergée (latin), écran d'accueil | 35 tests (dont 3 de présentation) ; vérifié à 375 et 320 px | `17b48c5`, `970a0ae`, `9766186` | Après le déploiement (1.16) : ajout à l'écran d'accueil, icône, ouverture en mode avion |
| 2026-11-04 | Dépôt GitHub branché (`MohandMazeghrane/Riselyo`, public) ; CI verte sur `main` ; Dependabot actif avec exclusions (TS, `@types/node`, React majeurs) | CI GitHub Actions ✅ | `2af6cf0`, `7aec2e8` | Rien |
| 2026-11-04 | PR Dependabot traitées (#1 fusionnée, #2 appliquée sur `main`, #3 #4 #6 fermées) ; 1.4 : secretlint en pré-commit et dans `npm run check` (blocage vérifié avec un faux jeton), `_headers` (CSP stricte, HSTS…) testé et appliqué en preview, aucune violation CSP | 44 tests | `ec80300`, `95fa7f7`, `7b790f7` | Rien (les en-têtes seront actifs après le déploiement 1.16) |
| 2026-11-04 | 1.5 : schéma Dexie v1 (17 tables, v1 figée par un test), harnais de migration (`upToVersion`), entité `Consent` (refus par défaut, `aiJournal` dépend de `ai`), `DexieConsentRepository` | 64 tests, couverture domaine + application 100 % | `29528b0`, `bea2426`, `9960e10` | Rien (pas encore d'écran qui écrit en base) |
| 2026-11-04 | Cahier des charges ajouté (`docs/`) ; couleur alignée sur #2563B8 ; 1.6 : onboarding partie A (A0 à A5) — domaine en TDD, 8 cas d'usage, schéma v2 (`lifeWheels`) + migration testée, 4 repositories, React Router 7, écrans + page « Besoin d'aide » ; règle ESLint « présentation → domaine : types seulement » | 175 tests, couverture domaine + application 99,5 % ; parcours complet vérifié dans le navigateur à 375 et 320 px, reprise après rechargement, données relues dans IndexedDB | `bb04e2d` … `160c19a` | Après le déploiement (1.16) : faire l'onboarding complet, quitter l'app en cours de route et vérifier la reprise, tester les liens 3114 / 15 / 112 |
| 2026-11-04 | 1.7 : écran A6 (7e étape de l'onboarding, tout désactivé par défaut, journal verrouillé sans IA), Profil minimal, Profil → Confidentialité (enregistrement immédiat, date affichée, révocation en cascade) ; conteneur construit par `createUseCases` | 201 tests ; vérifié dans le navigateur à 375 et 320 px (utilisateur existant renvoyé sur A6, dates, révocation) | `4c63023`, `8dcc81b` | Après le déploiement (1.16) : valider l'écran A6, puis changer un choix dans Profil → Confidentialité et vérifier la date |
| 2026-11-04 | 1.8 : check-ins du matin (coucher/réveil pré-remplis par le rythme, sommeil, énergie, priorité) et du soir (humeur en visages, stress, habitudes du jour, priorité tenue, victoire) ; `DayEntry`, `HabitLog`, repositories Dexie (pas de migration) ; cartes « À faire / Fait » sur l'accueil | 245 tests, couverture domaine + application 99 % ; vérifié dans le navigateur à 375 et 320 px (données relues dans IndexedDB, réponses reprises en rouvrant) | `aad0b8d` … `edcacde` | Après le déploiement (1.16) : faire les deux check-ins d'une vraie journée, chronométrer (objectif < 60 s), refaire un check-in après minuit pour vérifier qu'il compte pour la veille |

---

## 1. Protocole de session (obligatoire)

**Au début de chaque session**

1. Lire ce fichier en entier, puis la partie de `docs/cahier-des-charges.md` qui concerne la tâche à venir (chaque tâche y est repérée, par exemple « → tâche 1.6 »).
2. Vérifier que le code correspond à la section 0 (lancer `npm run check` si le projet existe déjà). Signaler tout écart.
3. Résumer l'état du projet en 5 lignes maximum.
4. Proposer 1 à 3 tâches de la phase en cours, dans l'ordre de la section 16, et **attendre la validation** de l'utilisateur avant de coder.

**Pendant la session**

- Une tâche à la fois, jusqu'à sa définition de « terminé » (section 17).
- Respecter strictement l'architecture (section 4), la sécurité (section 11), le RGPD (section 12) et le Clean Code (section 13).
- Tests d'abord pour tout le code du domaine (section 14).
- Commits petits et fréquents, au format conventionnel.
- Une décision structurante (nouvelle dépendance, changement d'architecture, de format de données, de fournisseur) = **demander d'abord**, puis l'ajouter au journal des décisions (section 19).
- Ne jamais commencer une phase dont la précédente n'a pas rempli son critère de passage.

**À la fin de chaque session**

1. `npm run check` doit passer.
2. Mettre à jour la section 0 : statuts, compteurs, tâche en cours, prochaine tâche, dette, journal des sessions.
3. Cocher les cases correspondantes en section 16.
4. Commit `docs: mise à jour du suivi`.
5. Donner un récapitulatif court : ce qui est fait, ce qui reste, ce que l'utilisateur doit tester sur son téléphone.

---

## 2. Le projet en bref

**Riselyo** est une web app mobile (PWA) **pour un seul utilisateur** qui l'aide à se reprendre en main physiquement et mentalement :

- suivi quotidien (sommeil, mouvement, alimentation, humeur, écrans, discipline) ;
- données de l'Apple Watch récupérées automatiquement (section 8) ;
- habitudes à 3 paliers (minimum / normal / excellent) ;
- score du jour et moteur de règles (tendances, corrélations, alertes) ;
- bilans tous les 2-3 jours, hebdo (« à éviter / à pousser ») et mensuels ;
- un **coach IA** (OpenAI pour l'instant) qui rédige les bilans et discute avec l'utilisateur.

**Contraintes non négociables**

1. Aucun compte développeur Apple/Google : distribution en PWA uniquement.
2. Coût d'hébergement : 0 €. Seule l'API IA est payante (budget de départ : ~5 € de crédit OpenAI).
3. Données personnelles stockées **sur le téléphone** (IndexedDB). Rien sur un serveur, sauf le strict nécessaire aux notifications et le **transit chiffré des données Apple Santé** (section 8), effacées dès que l'app les a récupérées.
4. L'IA ne produit **jamais** un chiffre : les chiffres viennent du moteur de règles, l'IA les met en mots.
5. Le filet de sécurité santé mentale (3114) fonctionne **sans IA et sans réseau**.
6. Interface 100 % en français, tutoiement, ton bienveillant, jamais culpabilisant.
7. Code professionnel malgré l'usage personnel : **Clean Architecture, Clean Code, sécurité de base et principes RGPD** appliqués partout.

---

## 3. Stack technique

| Couche | Choix | Notes |
| --- | --- | --- |
| Langage | TypeScript strict | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` ; pas de `any` |
| Front | React 18 + Vite | Composants fonctionnels + hooks uniquement |
| Style | Tailwind CSS 4 | Thème clair/sombre via la classe `dark`, tokens en CSS (`@theme`) dans `presentation/app/index.css` |
| Polices | Auto-hébergées (`@fontsource`) | **Pas de Google Fonts en CDN** (RGPD, section 12) |
| PWA | `vite-plugin-pwa` (Workbox) | Manifest, service worker, cache hors ligne |
| Routing | React Router | 5 onglets + écrans ponctuels |
| État UI | Zustand (léger) + `useLiveQuery` de Dexie | Pas de Redux |
| Données locales | IndexedDB via **Dexie.js** | Migrations versionnées |
| Graphiques | Recharts | Chargés à la demande |
| Dates | date-fns (locale `fr`) | Heure locale Europe/Paris, via un port `Clock` |
| Validation | Zod | À **chaque** frontière (section 11) |
| Relais IA + push + Santé | Cloudflare Worker (offre gratuite) | Garde tous les secrets |
| Stockage serveur minimal | Cloudflare KV | Abonnement push, textes de notif du jour, données Santé en transit (chiffrées, 7 j max) |
| Données Apple Watch | Raccourci iPhone → Worker | Automatisation quotidienne |
| Hébergement front | Cloudflare Pages | En-têtes de sécurité via `_headers` |
| Tests | Vitest + Testing Library | Couverture : domaine ≥ 90 %, application ≥ 80 % |
| Qualité | ESLint (+ `eslint-plugin-boundaries`), Prettier | Règles d'architecture vérifiées automatiquement |
| CI | GitHub Actions | lint, typecheck, tests, `npm audit`, build à chaque push |

---

## 4. Architecture (Clean Architecture)

### Les couches et la règle de dépendance

```
presentation  ─┐
               ├──▶  application  ──▶  domain
infrastructure ┘
```

Les dépendances vont **uniquement vers l'intérieur**. Le domaine ne connaît rien d'autre que lui-même.

| Couche | Contenu | Peut importer | N'importe jamais |
| --- | --- | --- | --- |
| `domain/` | Entités, règles métier pures, moteur de règles, détection de détresse, calculs Santé, **ports** (interfaces) | Rien (sauf `shared/`) | React, Dexie, fetch, Zod, date-fns, `Date.now()` |
| `application/` | Cas d'usage (un fichier = une action de l'utilisateur), orchestration | `domain/` | React, Dexie, fetch |
| `infrastructure/` | **Adaptateurs** qui implémentent les ports : Dexie, client Worker, IA, Santé, notifications, chiffrement | `domain/`, `application/` | `presentation/` |
| `presentation/` | Écrans, composants, hooks UI, textes | `application/`, types du `domain/` | `infrastructure/` directement (passe par l'injection) |

- **Ports** (dans `domain/ports/`) : `DayEntryRepository`, `HabitRepository`, `ReviewRepository`, `AIProvider`, `HealthSource`, `NotificationScheduler`, `Clock`, `CryptoService`, etc.
- **Composition root** : `presentation/app/container.ts` instancie les adaptateurs et les injecte dans les cas d'usage. C'est le seul endroit qui connaît les implémentations concrètes.
- La règle de dépendance est **vérifiée par ESLint** (`eslint-plugin-boundaries`) : une violation fait échouer la CI.
- Le Worker suit la même logique en plus petit : `routes/` → `handlers/` → `services/` → `adapters/` (OpenAI, KV, Web Push).

### Structure du dépôt

```
riselyo/
├── CLAUDE.md
├── README.md
├── docs/
│   ├── cahier-des-charges.md         # référence fonctionnelle (écrans, textes, logique métier)
│   ├── rgpd.md                       # registre des traitements (section 12)
│   ├── securite.md                   # procédures : rotation des secrets, incident
│   └── raccourci-sante.md            # guide + fichier .shortcut
├── .github/workflows/ci.yml
├── apps/
│   ├── web/
│   │   ├── public/                   # icônes, _headers (CSP…)
│   │   └── src/
│   │       ├── domain/
│   │       │   ├── entities/         # DayEntry, Habit, HealthDay, Review, CoachMemory…
│   │       │   ├── engine/           # score, trends, correlations, alerts, progression, summary
│   │       │   ├── health/           # parse : échantillons bruts → coucher, réveil, durée…
│   │       │   ├── safety/           # détection locale de détresse
│   │       │   ├── gamification/     # XP, niveaux, badges, séries, jokers
│   │       │   ├── ai/               # verify (contrôle des chiffres), règles de budget
│   │       │   ├── config/           # constantes métier (seuils, poids du score…)
│   │       │   ├── ports/            # interfaces
│   │       │   └── shared/           # Result<T, E>, erreurs de domaine
│   │       ├── application/
│   │       │   ├── checkin/          # submitMorningCheckin, submitEveningCheckin…
│   │       │   ├── habits/
│   │       │   ├── coach/            # sendCoachMessage, acceptMemoryFact…
│   │       │   ├── reviews/          # generateShortReview, generateWeeklyReview…
│   │       │   ├── health/           # importPendingHealthData, importHistory
│   │       │   └── privacy/          # exportAllData, eraseAllData, updateConsents
│   │       ├── infrastructure/
│   │       │   ├── db/               # schéma Dexie, migrations, repositories
│   │       │   ├── ai/               # client Worker, prompts, schémas Zod, fallback
│   │       │   ├── health/           # client /health/pull
│   │       │   ├── notifications/    # abonnement push
│   │       │   ├── crypto/           # chiffrement de l'export (Web Crypto)
│   │       │   └── clock/            # SystemClock
│   │       └── presentation/
│   │           ├── app/              # routes, layout, container.ts
│   │           ├── screens/          # today, checkin, coach, progress, reviews, profile, onboarding
│   │           ├── components/       # UI réutilisable (Button, Card, Ring, HelpBanner…)
│   │           ├── hooks/
│   │           └── content/          # textes FR, banques de messages
│   └── worker/
│       ├── src/
│       │   ├── routes/               # /ai, /push/*, /health/ingest, /health/pull, /privacy/erase
│       │   ├── handlers/
│       │   ├── services/             # auth, ratelimit, crypto, budget
│       │   ├── adapters/             # openai, kv, webpush
│       │   └── cron.ts
│       └── wrangler.toml
└── packages/
    └── shared/                       # schémas Zod et types partagés front/Worker
```

---

## 5. Modèle de données (Dexie)

```ts
// apps/web/src/infrastructure/db/schema.ts — version 1
profile          : '&id'                         // id = 'me' (unique)
consents         : '&key'                        // ai, aiJournal, health, notifications + date
coachProfile     : '&id'                         // pourquoi, pièges, ce qui fait du bien, ton
coachMemory      : '++id, createdAt'             // faits courts validés par l'utilisateur
dayEntries       : '&date'                       // 'YYYY-MM-DD'
healthDays       : '&date, importedAt'           // données Apple Santé calculées (section 8)
habits           : '++id, kind, active'          // kind: 'do' | 'reduce'
habitLogs        : '++id, [habitId+date], date'  // level: 0 | 'min' | 'normal' | 'excellent'
measurements     : '++id, date'                  // poids, taille, tests de forme
photos           : '++id, date'                  // Blob local, JAMAIS envoyé
reviews          : '++id, type, periodStart'     // type: '2-3d' | 'weekly' | 'monthly'
journal          : '++id, date, expiresAt'
conversations    : '++id, startedAt, mode'
messages         : '++id, conversationId, createdAt'
progression      : '&id'                         // xp, level, badges, streaks, jokers
aiUsage          : '++id, date, task'            // tokens in/out, coût estimé
settings         : '&key'
```

- Toute évolution de schéma = nouvelle `version()` Dexie avec migration testée. Ne jamais modifier une version existante.
- Les dates « jour » sont des chaînes `YYYY-MM-DD` en heure locale. Une journée se termine à 4 h du matin.
- Les entités du domaine sont distinctes des enregistrements Dexie : les repositories font la conversion.

---

## 6. Moteur de règles (`domain/engine/`)

### Score du jour (0-100)

| Composante | Poids | Calcul |
| --- | --- | --- |
| Habitudes | 35 | min = 50 %, normal = 100 %, excellent = 120 % ; moyenne plafonnée à 100 % |
| Sommeil | 20 | proximité de la durée cible + écart à l'heure de coucher cible (données de la montre en priorité) |
| Mouvement | 15 | minutes / objectif, plafonné |
| Esprit | 15 | humeur et stress normalisés (stress inversé) |
| Priorité du jour | 10 | tenue = 10, sinon 0 |
| Check-ins | 5 | 2,5 matin + 2,5 soir |

Score semaine = moyenne des jours, **le jour le plus bas retiré**. Jour sans données = exclu, pas compté 0.

### Constats

- **Corrélations** : actives après 14 jours. Seuil : écart ≥ 0,7 point (sur 5) et ≥ 4 jours dans chaque groupe.
- **Tendances** : semaine vs moyenne des 3 précédentes ; −15 % = « à surveiller », +15 % = « à pousser ».
- **Alertes** : 3 nuits < 6 h ; 3 soirs d'alcool sur 7 ; 0 mouvement en 4 jours ; humeur ≤ 2 pendant 4 jours.
- **Progression des paliers** : normal tenu 5/7 sur 2 semaines → proposer de monter ; < 3/7 sur 2 semaines → proposer de baisser.

Tous ces seuils sont des constantes nommées dans `domain/config/` — aucun nombre magique dans le code.

### Résumé envoyé à l'IA (`summary.ts`)

Objet JSON compact (< 2 Ko) : scores, moyennes par pilier, séries, constats classés par impact, focus de la semaine, objectifs. **Jamais** : journal brut (sauf consentement), photos, mesures corporelles, données Santé brutes, nom de famille, e-mail.

Chaque nombre du résumé a un identifiant (`"sleep_avg_7d": 6.4`) pour que `verify.ts` puisse contrôler les réponses.

---

## 7. Intégration IA (OpenAI)

### Principe

```
PWA → (code d'accès) → Cloudflare Worker → API OpenAI
                         └ clé OPENAI_API_KEY en secret Wrangler
```

- La clé OpenAI **n'apparaît jamais** dans le front, le dépôt ou les logs.
- Le front n'appelle l'IA que via le port `AIProvider` : passer à Claude plus tard = un nouvel adaptateur côté Worker.
- Le Worker exige `X-Access-Code`, limite à 60 requêtes / heure et rejette les payloads > 32 Ko.

### Modèles (variables du Worker)

| Variable | Valeur par défaut | Usage |
| --- | --- | --- |
| `MODEL_LIGHT` | `gpt-6-luna` | extraction saisie libre, phrase du jour, notifications, mini-bilan 2-3 j |
| `MODEL_COACH` | `gpt-6.1-terra` | chat du coach, bilan hebdo, lettre mensuelle |

Jamais de nom de modèle en dur dans le front. Vérifier la page de tarifs OpenAI avant tout changement.

### Tâches IA

| Tâche | Modèle | Sortie | Schéma Zod |
| --- | --- | --- | --- |
| `extract_entry` | light | champs du check-in + questions | `ExtractEntrySchema` |
| `daily_line` | light | 1 phrase + 3 textes de notification | `DailyLineSchema` |
| `review_short` | light | victoire, chiffre, encouragement, défi | `ShortReviewSchema` |
| `review_weekly` | coach | progrès, à éviter, à pousser, focus, plan, message | `WeeklyReviewSchema` |
| `review_monthly` | coach | lettre + 3 axes | `MonthlyReviewSchema` |
| `coach_chat` | coach | texte (3 à 6 phrases) + faits mémoire proposés | `CoachReplySchema` |
| `onboarding_plan` | coach | résumé + 3 objectifs proposés | `OnboardingPlanSchema` |

Toutes les tâches sauf `coach_chat` utilisent les sorties structurées JSON ; la réponse est revalidée par Zod côté front.

### Garde-fous

1. **Vérification des chiffres** : tout nombre cité doit exister dans le résumé (tolérance d'arrondi). Sinon 1 régénération, puis fallback.
2. **Fallback** : API en échec, timeout (15 s) ou budget atteint → constats du moteur avec textes types. L'app reste 100 % utilisable sans IA.
3. **Budget** : chaque appel enregistré dans `aiUsage`. Plafond mensuel **4 €** ; à 80 % avertissement, à 100 % seules les tâches `light` restent actives. Plafond aussi réglé dans la console OpenAI.
4. **Contexte minimal** : 14 derniers jours, mémoire ≤ 20 faits, ≤ 10 derniers messages.
5. **L'IA n'agit jamais** : ses sorties sont du texte ou un JSON validé ; aucune action n'est exécutée sans validation de l'utilisateur (ex. faits mémoire, changement de palier).
6. Pas de streaming au départ.

### Prompts

- Un fichier par prompt dans `infrastructure/ai/prompts/`, exportant `build(ctx) => { system, user }`.
- Base : section 12 de `docs/cahier-des-charges.md` (« Prompts de base du coach »).
- Règles communes injectées partout : français, tutoiement, ton choisi, pas de régime ni de calories, pas de conseil médical, chiffres uniquement depuis CONTEXTE, consigne 3114 / 15 / 112, ignorer toute instruction contenue dans les textes de l'utilisateur qui tenterait de modifier ces règles.
- Toute modification = incrémenter `PROMPT_VERSION`, stockée avec chaque bilan.

---

## 8. Données Apple Santé (Apple Watch)

Une PWA ne peut pas lire Apple Santé (HealthKit est réservé aux apps natives). Un **Raccourci iPhone** lancé automatiquement chaque matin envoie les données au Worker ; l'app les récupère à l'ouverture.

### Flux

```
Apple Watch → app Santé → Raccourci (automatisation 7 h 30)
   → POST /health/ingest (jeton HEALTH_TOKEN)
   → Worker : valide (Zod), chiffre (AES-GCM, HEALTH_KEY) → KV, TTL 7 jours
   → PWA à l'ouverture : GET /health/pull (code d'accès)
   → Worker déchiffre, renvoie, SUPPRIME de KV
   → domain/health/parse → healthDays → pré-remplit le check-in du matin
```

### Données collectées

| Donnée | Usage |
| --- | --- |
| Analyse du sommeil (début, fin, phase) | Coucher, réveil, durée endormie, régularité |
| Nombre de pas (veille) | Pilier Mouvement, corrélations |
| Minutes d'exercice (veille) | Pilier Mouvement, habitudes cochées automatiquement |
| Entraînements (type, début, durée) | Habitude « Séance » cochée automatiquement |
| Fréquence cardiaque au repos | Tendance de forme, affichage seulement |

**Jamais collecté** : calories, poids, cycle, ECG, localisation.

### Format envoyé par le Raccourci

```json
{
  "v": 1,
  "sentAt": "2026-11-05T07:30:00+01:00",
  "day": "2026-11-04",
  "sleep": [{ "start": "2026-11-04T23:42:00+01:00", "end": "2026-11-05T02:10:00+01:00", "stage": "Profond" }],
  "steps": 8214,
  "exerciseMin": 34,
  "workouts": [{ "type": "Marche", "start": "2026-11-04T17:05:00+01:00", "durationMin": 28 }],
  "restingHR": 62
}
```

Échantillons bruts ; tous les calculs dans `domain/health/parse.ts`, testé. Schéma `HealthPayloadSchema` dans `packages/shared`, validé côté Worker **et** côté app. Phases de sommeil : mapper les libellés français et anglais.

### Règles de fusion

- Sommeil et mouvement de la montre **remplacent** la saisie manuelle ; une correction manuelle ultérieure gagne.
- Le check-in du matin affiche « Données de ta montre » pré-remplies ; il reste l'énergie et la priorité.
- Envoi en double : la journée est écrasée, pas de doublon.
- Pas de données depuis 2 jours : message discret dans les réglages avec lien vers le guide. Jamais bloquant.

### Worker

- `POST /health/ingest` : `Authorization: Bearer <HEALTH_TOKEN>`, ≤ 64 Ko, 10 envois / jour max.
- `GET /health/pull` : `X-Access-Code`, renvoie les envois en attente puis les supprime.
- Chiffrement Web Crypto AES-GCM, IV aléatoire par envoi. Données jamais loguées. Clé KV `health:<sentAt>`, TTL 7 jours.

### Guide du Raccourci (affiché dans Profil → Apple Santé, copie dans `docs/raccourci-sante.md`)

1. App **Raccourcis** → nouveau raccourci « Riselyo Santé ».
2. « Rechercher des échantillons de santé » : sommeil (depuis hier 18 h), pas (hier), minutes d'exercice (hier), entraînements (hier), fréquence cardiaque au repos (dernier).
3. « Dictionnaire » au format ci-dessus.
4. « Obtenir le contenu de l'URL » : POST, corps JSON, en-tête `Authorization` avec le jeton affiché dans l'app.
5. **Automatisation** → « Heure de la journée » 7 h 30, tous les jours → « Exécuter immédiatement ».
6. Accepter les autorisations Santé au premier lancement.

Les noms d'actions peuvent varier selon la version d'iOS. Fournir le `.shortcut` prêt à l'emploi dans `docs/` une fois testé.

### Import de l'historique (phase 4)

Export complet depuis l'app Santé → import ponctuel de `export.xml` en streaming, types listés ci-dessus, 90 derniers jours.

---

## 9. Notifications

- Web Push via service worker + clés VAPID (secrets du Worker).
- iPhone : uniquement si la PWA est sur l'écran d'accueil (iOS 16.4+) ; tutoriel d'installation au premier lancement sur Safari.
- Chaque matin, le front envoie au Worker les 3 textes du jour + horaires ; stockés dans KV, envoyés par Cron Trigger.
- Max 3 notifications / jour, rien entre le coucher et le réveil.
- 3 jours sans check-in → un seul message chaleureux, puis silence.
- Le contenu des notifications reste générique sur l'écran verrouillé (pas d'humeur, de poids ou de détail de santé).

---

## 10. Santé mentale : filet de sécurité

- `domain/safety/` : détection locale de mots et expressions de détresse (français, variantes, fautes courantes). Testée unitairement.
- Avant l'envoi d'un message au coach **et** à l'enregistrement du journal : si détection → `HelpBanner` immédiat, **avant** toute réponse IA.
- `HelpBanner` : 3114 (prévention du suicide, 24 h/24, gratuit), 15 et 112, liens `tel:`. Aussi accessible en permanence (Profil → « Besoin d'aide »).
- Humeur ≤ 2 pendant 7 jours ou stress à 5 plusieurs jours → carte bienveillante invitant à parler à un proche ou à un médecin.
- Jamais désactivé, même sans IA ou hors ligne.
- Mention permanente : l'app est un outil de suivi, pas un professionnel de santé.

---

## 11. Sécurité applicative (minimum exigé)

L'app est personnelle, mais elle manipule des données de santé et une clé API payante. Ces règles sont obligatoires.

### Secrets

- Secrets uniquement en `wrangler secret` : `OPENAI_API_KEY`, `ACCESS_CODE`, `HEALTH_TOKEN`, `HEALTH_KEY`, `VAPID_PRIVATE_KEY`.
- `ACCESS_CODE` et `HEALTH_TOKEN` : 32 caractères aléatoires minimum, distincts. Comparaison en **temps constant**.
- `.dev.vars`, `.env*` dans `.gitignore` ; scan de secrets en pré-commit (`secretlint` ou `gitleaks`).
- Procédure de rotation documentée dans `docs/securite.md` (en cas de fuite ou de perte du téléphone).

### Worker

- CORS limité à l'origine de l'app (`ALLOWED_ORIGIN`) ; `/health/ingest` n'accepte que le jeton du Raccourci.
- Limites de débit et de taille sur chaque route ; réponse 429 au-delà.
- Validation Zod de **toute** entrée ; rejet de tout champ inconnu.
- Erreurs renvoyées génériques (pas de stack, pas de message de l'API OpenAI brut).
- Aucun log de contenu personnel : seulement route, statut, durée.

### Front

- **Jamais** de `dangerouslySetInnerHTML`, `innerHTML` ou `eval`. Les textes de l'IA et de l'utilisateur sont rendus comme du texte.
- Validation Zod des sorties IA, des données Santé et des fichiers importés (sauvegarde JSON).
- En-têtes via `public/_headers` : CSP stricte (`default-src 'self'`, `connect-src 'self' <origine du Worker>`, `img-src 'self' blob: data:`, `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (micro autorisé pour la dictée seulement).
- Aucun script, police ou traqueur tiers.
- Aucune donnée personnelle dans les URL.
- Code PIN / WebAuthn facultatif à l'ouverture ; export de sauvegarde chiffré par phrase de passe (Web Crypto, PBKDF2 + AES-GCM).

### Dépendances

- Le moins de dépendances possible ; justifier chaque ajout.
- `package-lock.json` versionné, `npm audit` en CI (échec sur vulnérabilité haute ou critique), Dependabot activé.

### IA

- Les textes de l'utilisateur envoyés à l'IA sont encadrés comme des **données**, pas des instructions (protection contre l'injection de prompt).
- Aucune sortie IA ne déclenche d'action sans validation explicite.

---

## 12. RGPD et vie privée

Un usage strictement personnel relève en principe de l'exemption domestique du RGPD, mais l'app traite des **données de santé** (catégorie particulière, article 9) et les fait transiter par des prestataires : on applique donc les principes du RGPD comme si c'était une app publique.

| Principe | Mise en œuvre |
| --- | --- |
| **Minimisation** | Seules les données listées sections 5 et 8 ; pas de calories, pas de localisation, pas d'identifiant inutile. Seul le prénom est envoyé à l'IA. |
| **Finalité** | Suivi personnel uniquement. Aucune analyse statistique externe, aucune publicité, aucun traqueur. |
| **Consentement explicite et révocable** | Écran de consentement à l'onboarding, un interrupteur par traitement : IA, journal envoyé à l'IA, Apple Santé, notifications. Tout est **désactivé par défaut** sauf le suivi local. Modifiable dans Profil → Confidentialité, avec la date du consentement. |
| **Transparence** | Écran « Mes données » : ce qui est stocké, où (téléphone, Worker, OpenAI), combien de temps. |
| **Durée de conservation** | Local : tant que l'utilisateur le souhaite. Journal « vider la tête » : 24 h. Conversations du coach : purge après 90 jours (réglable). KV : 7 jours max. `aiUsage` : 12 mois. Purge automatique au lancement de l'app. |
| **Droit d'accès et portabilité** | Export JSON complet et CSV (Profil → Mes données). |
| **Droit à l'effacement** | Bouton « Tout supprimer » : efface IndexedDB et caches, appelle `/privacy/erase` (purge KV, désabonnement push), rappelle de supprimer le Raccourci et de faire tourner les secrets. |
| **Sous-traitants et transferts** | OpenAI et Cloudflare sont des sociétés américaines : transferts hors UE. Réduire au minimum ce qui leur est envoyé ; vérifier dans les paramètres et conditions de l'API OpenAI la durée de conservation et la non-utilisation des données pour l'entraînement. |
| **Protection dès la conception** | Données locales par défaut, chiffrement en transit et au repos côté serveur, photos jamais envoyées, notifications génériques sur écran verrouillé. |
| **Registre** | `docs/rgpd.md` : tableau donnée / finalité / lieu / durée / base (consentement), tenu à jour à chaque nouvelle donnée. |

---

## 13. Clean Code et conventions

### Principes

- **Nommage explicite** : un nom dit ce que fait la chose (`computeDailyScore`, pas `calc`). Code en anglais, textes visibles en français dans `presentation/content/`.
- **Responsabilité unique** : une fonction fait une chose ; un module a une raison de changer.
- **Fonctions courtes** : ≤ 30 lignes, ≤ 3 paramètres (au-delà, un objet typé).
- **Pas de nombres magiques** : constantes nommées dans `domain/config/`.
- **Fonctions pures et immutabilité** dans le domaine ; aucun effet de bord, aucune lecture de l'heure (passer par `Clock`).
- **Erreurs explicites** : `Result<T, E>` dans le domaine et l'application ; exceptions uniquement aux bords (infrastructure), toujours capturées et traduites.
- **Retours anticipés** plutôt qu'imbrications ; pas de `else` après `return`.
- **Pas de code mort ni de code commenté.** Les commentaires expliquent le *pourquoi*, jamais le *quoi*.
- **DRY sans abstraction prématurée** : on factorise à la troisième répétition.
- **SOLID appliqué avec bon sens**, en particulier l'inversion de dépendance via les ports.
- TypeScript : pas de `any`, pas de `!` (assertion non nulle), types de retour explicites sur les fonctions exportées.

### Front

- Un composant par fichier, < 150 lignes ; aucune logique métier dans les composants (hooks + cas d'usage).
- Accessibilité : éléments natifs (`button`, `a`, `label`), cibles ≥ 44 px, contrastes AA, `aria-label` sur les icônes seules.
- Mobile d'abord : 375 px, utilisable d'une main ; tester à 320 px.
- Performances : premier affichage < 2 s en 4G ; graphiques chargés à la demande.
- Jamais d'écran blanc : chaque écran gère chargement, vide et erreur.

### Git

- Commits conventionnels (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `security:`), petits et fréquents.
- Branche `main` toujours déployable.

---

## 14. Tests et qualité

- **Domaine** : tests écrits **avant** le code (TDD), couverture ≥ 90 %. Chaque seuil métier a un test aux bornes.
- **Application** : cas d'usage testés avec des faux adaptateurs (repositories en mémoire, `FakeClock`, `FakeAIProvider`), couverture ≥ 80 %.
- **Infrastructure** : migrations Dexie, schémas Zod, client Worker (réponses simulées), chiffrement.
- **Worker** : chaque route testée (auth refusée, payload invalide, limite de débit, cas nominal).
- **Présentation** : tests des parcours clés (check-in, coach, bilan) avec Testing Library.
- Données de test réalistes mais **fictives** ; jamais de vraies données de l'utilisateur dans le dépôt.
- `npm run check` = lint + typecheck + tests + vérification des frontières d'architecture.

---

## 15. Commandes

```bash
npm install
npm run dev -w apps/web           # PWA en local
npm run dev -w apps/worker        # Worker en local (wrangler dev)

npm run check                     # lint + typecheck + tests + architecture
npm test                          # tous les tests
npm run test:domain               # domaine uniquement
npm run coverage
npm audit

npm run deploy -w apps/worker     # wrangler deploy
npm run build -w apps/web         # puis Cloudflare Pages

# Secrets du Worker (une seule fois, puis à chaque rotation)
wrangler secret put OPENAI_API_KEY
wrangler secret put ACCESS_CODE
wrangler secret put HEALTH_TOKEN
wrangler secret put HEALTH_KEY
wrangler secret put VAPID_PRIVATE_KEY
```

---

## 16. Plan de production (détail des tâches)

Chaque phase se termine par une app **utilisable et déployée**. Cocher les cases au fil de l'eau et reporter les compteurs en section 0.

### Phase 1 — Socle et suivi de base (semaines 1-2)

- [x] 1.1 Monorepo, TypeScript strict, ESLint (+ frontières d'architecture), Prettier, Vitest, CI GitHub Actions
- [x] 1.2 Squelette Clean Architecture : couches, ports, `container.ts`, `Result`, `Clock`
- [x] 1.3 PWA installable (manifest, icônes, service worker, hors ligne), polices auto-hébergées
- [x] 1.4 En-têtes de sécurité (`_headers`, CSP) et scan de secrets en pré-commit
- [x] 1.5 Schéma Dexie v1 + repositories + tests de migration
- [x] 1.6 Onboarding partie A (formulaire, roue de vie, horaires) — sans IA
- [x] 1.7 Écran de consentements + Profil → Confidentialité
- [x] 1.8 Check-ins matin et soir en boutons
- [ ] 1.9 Habitudes à 3 paliers + boutons rapides
- [ ] 1.10 Écran Aujourd'hui
- [ ] 1.11 Filet de sécurité complet (`domain/safety`, `HelpBanner`, page « Besoin d'aide »)
- [ ] 1.12 Export JSON / CSV et import validé par Zod
- [ ] 1.13 « Tout supprimer » (partie locale)
- [ ] 1.14 Écran « Mes données » + `docs/rgpd.md` + `docs/securite.md`
- [ ] 1.15 Purge automatique selon les durées de conservation
- [ ] 1.16 Déploiement Cloudflare Pages + tutoriel d'installation iPhone

### Phase 2 — Coach IA et Apple Santé (semaines 3-4)

- [ ] 2.1 Worker : structure en couches, auth temps constant, CORS, limites, validation Zod, logs sans données perso
- [ ] 2.2 Route `/ai` + adaptateur OpenAI + port `AIProvider` côté front
- [ ] 2.3 Schémas des sorties, budget, fallback, vérification des chiffres (version simple)
- [ ] 2.4 Onboarding parties B et C (entretien + plan proposé)
- [ ] 2.5 Profil coach + mémoire + écran « Ce que le coach sait de moi »
- [ ] 2.6 Onglet Coach : chat, raccourcis, modes (libre, motivation, urgence envie, jour difficile)
- [ ] 2.7 Saisie libre avec `extract_entry` + écran de confirmation
- [ ] 2.8 Dictée vocale (Web Speech API) si disponible
- [ ] 2.9 Mode « jour difficile »
- [ ] 2.10 Compteur de coût dans les réglages
- [ ] 2.11 Apple Santé : `/health/ingest`, `/health/pull`, chiffrement KV, `domain/health/parse` testé
- [ ] 2.12 Check-in du matin pré-rempli par la montre + habitudes cochées automatiquement
- [ ] 2.13 Profil → Apple Santé : jeton, guide du Raccourci, date du dernier import ; `/privacy/erase` côté Worker

### Phase 3 — Moteur et bilans (semaines 5-6)

- [ ] 3.1 `domain/engine` complet : score, tendances, corrélations, alertes, progression (TDD, ≥ 90 %)
- [ ] 3.2 `summary` + vérification des chiffres complète
- [ ] 3.3 Onglet Progrès : courbe du score, calendrier, sommeil, humeur/énergie, habitudes, roue de vie
- [ ] 3.4 Mini-bilan « Ça avance » tous les 2-3 jours
- [ ] 3.5 Bilan hebdo en 6 parties + choix du focus + plan de la semaine
- [ ] 3.6 Propositions automatiques de changement de palier
- [ ] 3.7 Liens découverts, y compris avec les pas et le sommeil de la montre
- [ ] 3.8 Compteurs « depuis le début » et journal des victoires

### Phase 4 — Finitions (semaines 7-8)

- [ ] 4.1 Bilan mensuel + lettre du coach + comparaison J0 / J30
- [ ] 4.2 Notifications push personnalisées (VAPID, KV, Cron), contenu générique sur écran verrouillé
- [ ] 4.3 Gamification : XP, 10 niveaux, badges, séries, jokers, récompenses perso, défis IA
- [ ] 4.4 Journal guidé + boîte à outils (respiration, ancrage, recadrage, anti-procrastination)
- [ ] 4.5 Code PIN / WebAuthn + export chiffré + rappel de sauvegarde
- [ ] 4.6 Import de l'historique Apple Santé (90 jours)
- [ ] 4.7 Thème sombre automatique le soir, animations de célébration
- [ ] 4.8 Audit sécurité (section 11) et RGPD (section 12) — corriger tous les écarts
- [ ] 4.9 Audit accessibilité + performances (Lighthouse PWA ≥ 90)

---

## 17. Définition de « terminé »

Une tâche n'est terminée que si :

1. `npm run check` passe (lint, types, tests, frontières d'architecture) ;
2. les tests couvrent le nouveau code au niveau exigé (section 14) ;
3. la règle de dépendance (section 4) est respectée ;
4. aucun point des sections 11 (sécurité) et 12 (RGPD) n'est enfreint ;
5. l'écran fonctionne à 375 px et hors ligne (les appels IA basculent sur le fallback) ;
6. aucun texte visible n'est en anglais ;
7. la case est cochée en section 16 et la section 0 est à jour.

---

## 18. Ce qu'il ne faut jamais faire

- Mettre un secret dans le front, le dépôt ou un log.
- Importer React, Dexie, `fetch` ou `Date.now()` dans `domain/`.
- Laisser l'IA calculer un score, une moyenne ou une tendance, ou déclencher une action sans validation.
- Envoyer le journal, les photos, les mesures corporelles ou les données Santé brutes à l'IA sans consentement explicite.
- Faire dépendre le bandeau 3114 de l'IA ou du réseau.
- Compter les calories, proposer un régime ou des objectifs de poids agressifs.
- Afficher un message culpabilisant.
- Utiliser `dangerouslySetInnerHTML`, `innerHTML` ou `eval`.
- Charger un script, une police ou un traqueur tiers.
- Garder des données Santé dans KV après leur récupération.
- Interpréter la fréquence cardiaque comme un diagnostic.
- Ajouter une dépendance sans le justifier, ou modifier une version existante du schéma Dexie.
- Commencer une phase sans que la précédente ait rempli son critère de passage.
- Terminer une session sans mettre à jour la section 0.

---

## 19. Journal des décisions

| Date | Décision | Raison |
| --- | --- | --- |
| 2026-11-04 | OpenAI comme premier fournisseur IA | Crédit de 5 € déjà disponible |
| 2026-11-04 | Port `AIProvider` dès le départ | Passer à Claude sans réécrire le front |
| 2026-11-04 | PWA + Cloudflare (Pages, Worker, KV) | 0 € d'hébergement, pas de compte développeur |
| 2026-11-04 | `gpt-6-luna` (léger) / `gpt-6.1-terra` (coach) | Meilleur rapport qualité/prix pour ~4 €/mois |
| 2026-11-04 | Apple Santé via Raccourci automatique + Worker | Une PWA ne peut pas lire HealthKit ; zéro geste quotidien, données chiffrées et effacées après récupération |
| 2026-11-04 | Clean Architecture (domaine / application / infrastructure / présentation) | Code testable, fournisseurs remplaçables, règles métier isolées |
| 2026-11-04 | Principes RGPD appliqués malgré l'usage personnel | Données de santé + transferts vers des prestataires américains |
| 2026-11-04 | Polices auto-hébergées, aucun tiers chargé par le front | Vie privée et CSP stricte |
| 2026-11-04 | Nom de l'app : **Riselyo** (remplace « Reprise ») | Nom qui sonne « app », domaine riselyo.com libre à la vérification |
| 2026-11-04 | Couleur principale : bleu (maquette v1 recolorée) | Préférence de l'utilisateur ; orange réservé aux points « à éviter » |
| 2026-11-04 | TypeScript 6.0, ESLint 10 (config « flat »), Vitest 5, Node 24 | Dernières versions compatibles entre elles (typescript-eslint exige TS < 6.1) |
| 2026-11-04 | Dépendances de dev d'outillage : `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`, `globals`, `@vitest/coverage-v8`, `@types/node` | Nécessaires à ESLint, Prettier et à la mesure de couverture exigée section 14 |
| 2026-11-04 | Isolation du domaine et de l'application par ESLint natif (`no-restricted-imports/globals/syntax`) en plus de `eslint-plugin-boundaries` | Interdit bibliothèques externes, `fetch` et `Date.now()` sans dépendance supplémentaire ; vérifié par `apps/web/test/architecture.test.ts` |
| 2026-11-04 | `SystemClock` via `Intl.DateTimeFormat` (fuseau Europe/Paris), pas date-fns | Aucune dépendance pour l'heure locale ; date-fns reste prévu pour l'affichage |
| 2026-11-04 | `LocalDateTime` + `dayKeyOf` dans le domaine ; bascule de journée à 4 h (`DAY_ROLLOVER_HOUR`) | Règle métier « une journée se termine à 4 h » testée dans le domaine, le port `Clock` ne fournit que l'heure murale |
| 2026-11-04 | Faux adaptateurs de test dans `apps/web/test/fakes/` | Hors de `src/` : jamais embarqués dans le build |
| 2026-11-04 | Police Inter (`@fontsource-variable/inter`), sous-ensemble latin seulement | Choix de l'utilisateur ; le latin couvre le français et divise par deux le cache hors ligne (209 Kio au lieu de 377) |
| 2026-11-04 | Tailwind 4 (tokens dans `@theme`) au lieu de Tailwind 3 (`tailwind.config.ts`) | Choix de l'utilisateur : version maintenue ; section 3 mise à jour |
| 2026-11-04 | Vite 8, `@vitejs/plugin-react`, `vite-plugin-pwa` (Workbox `generateSW`, `autoUpdate`, enregistrement par script externe), jsdom + Testing Library | Stack prévue section 3 ; script externe compatible avec une CSP `script-src 'self'` |
| 2026-11-04 | Icônes générées par `apps/web/scripts/generate-icons.mjs` (encodeur PNG maison avec `zlib`) | Aucune dépendance d'image ; regénérer avec `npm run icons -w apps/web` |
| 2026-11-04 | Dépôt GitHub `MohandMazeghrane/Riselyo` (public) ; CI au push sur `main` et sur les PR | Choix de l'utilisateur ; aucun secret ni donnée perso dans le dépôt (sections 11 et 12) |
| 2026-11-04 | secretlint (+ preset recommandé) et `simple-git-hooks` pour le pré-commit, plutôt que gitleaks | Installés par `npm install`, aucun binaire à installer à part, fonctionne sous Windows ; scan aussi dans `npm run check` donc en CI |
| 2026-11-04 | En-têtes de `public/_headers` lus par `apps/web/build/securityHeaders.ts`, appliqués au `vite preview` et testés | Même politique en local et en production ; une régression de la CSP fait échouer les tests |
| 2026-11-04 | Dexie 4 ; `fake-indexeddb` (dev) pour les tests, injecté via les options de Dexie (pas de polyfill global) | Validé par l'utilisateur ; tests rapides, une base isolée par test |
| 2026-11-04 | Schéma v1 complet dès maintenant, repositories au fil des tâches | Validé par l'utilisateur ; les index sont figés, les formats de données sont définis quand l'écran qui les utilise arrive |
| 2026-11-04 | Historique `SCHEMA_VERSIONS` en ajout seul + test qui fige la v1 | Applique « ne jamais modifier une version existante » automatiquement |
| 2026-11-04 | Consentement « journal envoyé à l'IA » subordonné au consentement « IA » (révocation en cascade) | Le journal ne peut partir vers l'IA que si l'IA est autorisée |
| 2026-11-04 | Enregistrements relus avec une garde de type ; tout enregistrement illisible retombe sur la valeur la plus protectrice (consentement refusé) | Robustesse et vie privée par défaut, sans dépendance supplémentaire (Zod arrivera avec les frontières réseau et import) |
| 2026-11-04 | Couleur principale #2563B8 (cahier des charges) au lieu de #2563eb | Alignement validé par l'utilisateur ; contraste AA conservé |
| 2026-11-04 | Schéma Dexie v2 : table `lifeWheels` (`&day`) | Validé par l'utilisateur ; une roue datée par jour (jour 0 puis tous les 30 jours) |
| 2026-11-04 | Radar de la roue de vie en SVG fait main (pas Recharts) | Validé par l'utilisateur ; aucune dépendance pour 8 axes, Recharts reste prévu pour 3.3 |
| 2026-11-04 | « Pas d'alcool » démarre au palier normal ; A5 ne propose que les 10 habitudes « à faire » | Validé par l'utilisateur ; pas de palier minimum dans le catalogue, habitudes à réduire en 1.9 |
| 2026-11-04 | Page « Besoin d'aide » statique (3114, 15, 112) dès la 1.6 | Validé par l'utilisateur ; le lien de l'écran A0 doit fonctionner, hors ligne |
| 2026-11-04 | React Router 7 (la v8 exige React 19, ignorée par Dependabot) | Stack prévue section 3, compatible React 18 |
| 2026-11-04 | La présentation n'importe du domaine que des types (règle `boundaries`) ; façade `application/onboarding/onboardingForm.ts` pour les listes et calculs en direct | Applique la section 4 à la lettre et la vérifie automatiquement |
| 2026-11-04 | Jour 0 = jour de validation de l'écran A0 ; mesures et roue de vie datées du jour 0 ; objectifs datés du jour du choix | Une seule « photo de départ » cohérente pour les comparaisons |
| 2026-11-04 | Consentements : A6 est la 7e étape de l'onboarding ; un refus est aussi une décision datée ; Confidentialité enregistre chaque interrupteur immédiatement | Section 12 : consentement explicite, révocable, avec sa date ; un utilisateur déjà inscrit est renvoyé sur A6 |
| 2026-11-04 | Profil minimal créé dès la 1.7 (lien depuis l'accueil) | La section 12 place Confidentialité dans Profil ; la barre d'onglets arrive en 1.10 |
| 2026-11-04 | Format `dayEntries` : `{ date, morning, evening }`, chaque check-in daté (`completedAt` ISO) ; relu à travers les règles du domaine | Un enregistrement par jour (4 h du matin), refaire un check-in remplace ses réponses |
| 2026-11-04 | Les habitudes du soir sont saisies dans le check-in du soir dès la 1.8 (table `habitLogs`, « pas fait » = 0) ; une habitude non renseignée n'est pas enregistrée | Le cahier les place dans le check-in du soir ; ne jamais inventer de réponse |
| 2026-11-04 | Priorité du jour facultative (objectif, texte libre de 80 caractères, ou aucune) ; « priorité tenue » demandée seulement s'il y en avait une | Check-in en moins de 60 s, sans culpabiliser |
| 2026-11-04 | Visages d'humeur dessinés en SVG (trait), pas d'emoji | Cahier, section 11 : « icônes en trait, jamais d'emoji » |
| 2026-11-04 | Lecture des enregistrements Dexie via `asFields` + règles du domaine ; profil illisible = erreur de stockage, habitude illisible = ignorée | Aucune donnée corrompue affichée comme valide, sans dépendance supplémentaire |
| 2026-11-04 | Conteneur fourni aux écrans via un contexte React (`ContainerProvider` / `useContainer`) | Injection sans import de l'infrastructure ; les tests injectent des faux |

> Ajouter une ligne à chaque décision structurante.
