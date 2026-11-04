# Riselyo — Sécurité : mesures, secrets et procédures

> Complète la section 11 de `CLAUDE.md`. Dernière mise à jour : **2026-11-04** (tâche 1.14).
> Les éléments marqués **(phase 2)** n'existent pas encore : ils arrivent avec le Worker Cloudflare (tâche 2.1 et suivantes).

## 1. Mesures en place

| Domaine       | Mesure                                                                                                                                                                       | Où                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| En-têtes HTTP | CSP stricte (`default-src 'self'`, `connect-src 'self'`, `frame-ancestors 'none'`…), HSTS, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (micro seulement) | `apps/web/public/_headers`, testés par `apps/web/test/securityHeaders.test.ts` |
| Tiers         | Aucun script, police ou traqueur tiers ; police Inter auto-hébergée                                                                                                          | Build Vite                                                                     |
| Rendu         | Jamais de `dangerouslySetInnerHTML`, `innerHTML` ou `eval` ; textes rendus comme du texte                                                                                    | Règles ESLint et revue                                                         |
| Entrées       | Sauvegardes importées validées par Zod (schémas stricts, champ inconnu refusé) ; enregistrements relus à travers les règles du domaine                                       | `infrastructure/db/backup/`                                                    |
| Export        | CSV protégé contre l'injection de formules                                                                                                                                   | `application/privacy/daysCsv.ts`                                               |
| Secrets       | Scan `secretlint` en pré-commit (fichiers indexés) et dans `npm run check` (donc en CI) ; `.dev.vars` et `.env*` ignorés par git                                             | `scripts/check-staged-secrets.mjs`, `.secretlintrc.json`, `.gitignore`         |
| Dépendances   | `package-lock.json` versionné, `npm audit --audit-level=high` en CI, Dependabot hebdomadaire                                                                                 | `.github/`                                                                     |
| Architecture  | Frontières vérifiées par ESLint : le domaine n'importe ni réseau, ni stockage, ni bibliothèque                                                                               | `eslint.config.js`, `apps/web/test/architecture.test.ts`                       |

Limite connue : `secretlint` ne reconnaît que les secrets à format connu. `ACCESS_CODE` et `HEALTH_TOKEN` (chaînes aléatoires) ne seraient pas détectés : ne jamais les écrire ailleurs que dans `.dev.vars` et `wrangler secret`.

## 2. Inventaire des secrets (phase 2)

| Secret              | Rôle                                               | Où il vit                                  | Format                                               |
| ------------------- | -------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `OPENAI_API_KEY`    | Appeler l'API OpenAI                               | `wrangler secret` uniquement               | Fourni par OpenAI                                    |
| `ACCESS_CODE`       | Autoriser l'app à appeler le Worker                | `wrangler secret` + réglage local de l'app | ≥ 32 caractères aléatoires                           |
| `HEALTH_TOKEN`      | Autoriser le Raccourci à envoyer les données Santé | `wrangler secret` + Raccourci iPhone       | ≥ 32 caractères aléatoires, distinct d'`ACCESS_CODE` |
| `HEALTH_KEY`        | Chiffrer les données Santé dans KV (AES-GCM)       | `wrangler secret` uniquement               | Clé AES 256 bits en base64                           |
| `VAPID_PRIVATE_KEY` | Signer les notifications push                      | `wrangler secret` uniquement               | Paire VAPID                                          |

Règles : jamais dans le front, le dépôt, un log ou une capture d'écran ; comparaison en temps constant côté Worker ; un plafond de dépense est aussi réglé dans la console OpenAI.

Générer une valeur aléatoire (exemple, dans un terminal local, jamais dans un fichier versionné) :

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

## 3. Rotation d'un secret (phase 2)

À faire en cas de fuite, de doute, de perte du téléphone, ou une fois par an.

1. **Générer** la nouvelle valeur (commande ci-dessus ; nouvelle clé dans la console OpenAI pour `OPENAI_API_KEY` ; nouvelle paire pour VAPID).
2. **Remplacer** dans le Worker : `wrangler secret put <NOM>` puis coller la valeur.
3. **Mettre à jour les clients** :
   - `ACCESS_CODE` : le saisir à nouveau dans l'app (Réglages).
   - `HEALTH_TOKEN` : le remplacer dans le Raccourci « Riselyo Santé ».
   - `VAPID_PRIVATE_KEY` : l'app doit se réabonner aux notifications.
4. **Révoquer l'ancienne valeur** : supprimer l'ancienne clé dans la console OpenAI ; les autres sont invalidées dès l'étape 2.
5. **Vérifier** : un appel au coach, un import Santé et une notification de test fonctionnent ; les anciens identifiants reçoivent 401.
6. **Noter** la date dans le journal ci-dessous.

Cas de `HEALTH_KEY` : les envois Santé encore dans KV, chiffrés avec l'ancienne clé, deviennent illisibles. Ils expirent seuls (7 jours au plus) ; l'app réimporte au besoin le lendemain.

## 4. Procédures d'incident

### Téléphone perdu ou volé

1. Verrouiller ou effacer le téléphone à distance (Localiser).
2. **(phase 2)** Faire tourner `ACCESS_CODE` et `HEALTH_TOKEN` (section 3), puis appeler `/privacy/erase` depuis un autre appareil si possible.
3. Restaurer sur le nouveau téléphone depuis la dernière sauvegarde exportée (Profil → Mes données).

### Secret publié par erreur (commit, capture, message)

1. Faire tourner le secret **immédiatement** (section 3) : le retirer de l'historique git ne suffit pas, il faut le considérer comme compromis.
2. Pour `OPENAI_API_KEY` : vérifier la consommation dans la console OpenAI.
3. Vérifier que le scan de secrets tourne bien (`npm run secrets`) et ajouter une règle si le format n'était pas détecté.

### Consommation IA anormale (phase 2)

1. Le plafond OpenAI bloque au-delà du budget ; le fallback de l'app garde tout utilisable sans IA.
2. Faire tourner `ACCESS_CODE` et `OPENAI_API_KEY`.
3. Vérifier la limite de débit du Worker (60 requêtes / heure) dans ses logs (route, statut, durée — jamais de contenu).

### Vulnérabilité dans une dépendance

1. La CI échoue sur une alerte haute ou critique : appliquer la PR Dependabot ou mettre à jour à la main.
2. Si aucun correctif n'existe : évaluer si le code vulnérable est livré dans l'app (outillage de dev ou bundle) et noter la décision dans la dette technique de `CLAUDE.md`.

### Données abîmées sur le téléphone

1. Les enregistrements illisibles sont ignorés ou signalés, jamais affichés comme valides.
2. Exporter ce qui peut l'être, puis « Tout supprimer » et restaurer la dernière sauvegarde saine.

## 5. Contrôles réguliers

- À chaque session : `npm run check` (lint, types, tests, frontières, scan de secrets).
- À chaque push : CI (audit des dépendances, couverture, build).
- Chaque mois **(phase 2)** : consommation OpenAI, logs du Worker, réglages de conservation chez OpenAI.
- En 4.8 : audit complet des sections 11 et 12 de `CLAUDE.md`.

## 6. Journal des rotations et incidents

| Date | Événement | Action |
| ---- | --------- | ------ |
| —    | Aucun     | —      |
