# Riselyo — Registre des traitements (RGPD)

> Tenu à jour à chaque nouvelle donnée (`CLAUDE.md`, section 12). Dernière mise à jour : **2026-11-04** (tâche 1.14).
> Riselyo est utilisée par une seule personne, pour elle-même : l'exemption domestique du RGPD s'applique en principe. Comme l'app traite des **données de santé** (article 9) et fera transiter certaines données par des prestataires américains, les principes du RGPD sont appliqués comme pour une app publique.

## Responsable et personne concernée

- **Responsable** : l'utilisateur lui-même (usage personnel), qui est aussi la seule personne concernée.
- **Finalité unique** : le suivi personnel de sa forme physique et mentale. Aucune publicité, aucun traqueur, aucune analyse statistique externe, aucune revente.

## Données traitées aujourd'hui (en service)

Tout est stocké **sur le téléphone** (IndexedDB du navigateur). Rien n'est envoyé sur Internet.

| Donnée                     | Contenu                                                                                                                                                                                                             | Finalité                                                                   | Lieu                                             | Durée de conservation                   | Base                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------- | ------------------------------------------------ |
| Profil                     | Prénom, jour 0, « pourquoi », rythme (réveil, coucher, durée de sommeil cible, heure du check-in du soir, jours de sport), étapes de l'onboarding                                                                   | Personnaliser le suivi                                                     | Téléphone                                        | Jusqu'à « Tout supprimer »              | Consentement (usage volontaire)                  |
| Consentements              | Choix pour IA, journal envoyé à l'IA, Apple Santé, notifications, avec leur date                                                                                                                                    | Prouver et respecter les choix                                             | Téléphone                                        | Jusqu'à « Tout supprimer »              | Obligation de preuve du consentement             |
| Journées                   | Check-in du matin (coucher, réveil, qualité du sommeil, énergie, priorité), du soir (humeur, stress, priorité tenue, victoire), compteurs des boutons rapides (eau, marche, séances, repas sains, envies résistées) | Suivi quotidien                                                            | Téléphone                                        | Jusqu'à « Tout supprimer »              | Consentement explicite (donnée de santé, art. 9) |
| Habitudes et paliers notés | Habitudes suivies ou arrêtées, palier visé, palier atteint chaque jour                                                                                                                                              | Suivi des habitudes                                                        | Téléphone                                        | Jusqu'à « Tout supprimer »              | Consentement explicite (art. 9)                  |
| Mesures                    | Poids, tour de taille, pompes, gainage, 1 km de marche rapide (toutes facultatives)                                                                                                                                 | Comparer avec le point de départ                                           | Téléphone, **jamais envoyées à l'IA**            | Jusqu'à « Tout supprimer »              | Consentement explicite (art. 9)                  |
| Roue de vie                | Notes de 1 à 10 sur 8 domaines, datées                                                                                                                                                                              | Mesurer le chemin parcouru                                                 | Téléphone                                        | Jusqu'à « Tout supprimer »              | Consentement explicite (art. 9)                  |
| Textes libres              | « Pourquoi », priorité libre, victoire du jour                                                                                                                                                                      | Suivi ; analysés **localement** par la détection de détresse (aucun envoi) | Téléphone                                        | Jusqu'à « Tout supprimer »              | Consentement explicite (art. 9)                  |
| Fichiers exportés          | Sauvegarde JSON, journées en CSV                                                                                                                                                                                    | Droit d'accès et portabilité                                               | Là où l'utilisateur les enregistre, **en clair** | Sous la responsabilité de l'utilisateur | Demande de l'utilisateur                         |

Les caches du navigateur (service worker) ne contiennent que les fichiers de l'app, aucune donnée personnelle.

## Traitements prévus (pas encore en service)

Chacun ne démarrera que si le consentement correspondant est donné (désactivé par défaut) et sera vérifié avant tout envoi.

| Donnée                                                                                              | Finalité                                                 | Lieu                                                              | Durée prévue                                                                       | Consentement                     | Tâche        |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- | ------------ |
| Prénom + résumé chiffré (< 2 Ko, sans journal brut, photos, mesures, données Santé brutes)          | Coach IA, bilans                                         | Téléphone → Worker Cloudflare → OpenAI                            | Non conservé par le Worker ; conservation OpenAI à vérifier (voir plus bas)        | IA                               | 2.2          |
| Texte du journal                                                                                    | Aide du coach à prendre du recul                         | Téléphone → Worker → OpenAI                                       | Journal « vider la tête » : 24 h sur le téléphone                                  | Journal envoyé à l'IA (exige IA) | 4.4          |
| Conversations du coach                                                                              | Continuité des échanges                                  | Téléphone                                                         | 90 jours (réglable), purge au lancement                                            | IA                               | 2.6, 1.15    |
| Mémoire du coach                                                                                    | Faits courts validés par l'utilisateur                   | Téléphone                                                         | Jusqu'à suppression par l'utilisateur                                              | IA                               | 2.5          |
| Consommation IA                                                                                     | Respect du budget                                        | Téléphone                                                         | 12 mois                                                                            | IA                               | 2.3          |
| Données Apple Santé (sommeil, pas, minutes d'exercice, entraînements, fréquence cardiaque au repos) | Pré-remplir le check-in du matin                         | iPhone → Worker → KV Cloudflare **chiffré (AES-GCM)** → téléphone | KV : effacé dès la récupération, 7 jours au plus ; téléphone : jusqu'à suppression | Apple Santé                      | 2.11         |
| Abonnement push + 3 textes du jour                                                                  | Notifications (contenu générique sur l'écran verrouillé) | Worker + KV Cloudflare                                            | Jusqu'au désabonnement ; textes du jour remplacés chaque jour                      | Notifications                    | 4.2          |
| Photos                                                                                              | Comparaison visuelle                                     | Téléphone, **jamais envoyées**                                    | Jusqu'à suppression                                                                | — (locales)                      | Non planifié |

Jamais collecté : calories, poids envoyé à l'IA, cycle, ECG, localisation, nom de famille, e-mail.

## Sous-traitants et transferts hors UE

| Prestataire             | Rôle                              | Pays       | Données concernées                                                      | État             |
| ----------------------- | --------------------------------- | ---------- | ----------------------------------------------------------------------- | ---------------- |
| Cloudflare (Pages)      | Hébergement des fichiers de l'app | États-Unis | Aucune donnée personnelle (journaux techniques Cloudflare : adresse IP) | À partir de 1.16 |
| Cloudflare (Worker, KV) | Relais IA, push, transit Santé    | États-Unis | Voir « Traitements prévus »                                             | Phase 2          |
| OpenAI                  | Rédaction des textes du coach     | États-Unis | Prénom et résumés chiffrés                                              | Phase 2          |
| GitHub                  | Code source                       | États-Unis | **Aucune** (aucune donnée personnelle dans le dépôt)                    | En service       |

À vérifier **avant** la phase 2 : durée de conservation des requêtes API chez OpenAI et non-utilisation pour l'entraînement (paramètres du compte API), localisation et durée des journaux Cloudflare.

## Droits de la personne

| Droit                   | Mise en œuvre                                                                   | État                              |
| ----------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| Information             | Écran « Mes données » (ce qui est gardé, où, combien de temps)                  | En service (1.14)                 |
| Accès et portabilité    | Export JSON complet et CSV des journées                                         | En service (1.12)                 |
| Rectification           | Refaire un check-in, changer un palier, modifier ses réponses                   | En service                        |
| Effacement              | « Tout supprimer » (téléphone) ; partie serveur `/privacy/erase`                | Téléphone : 1.13 ; serveur : 2.13 |
| Retrait du consentement | Profil → Confidentialité, un interrupteur par traitement, révocation en cascade | En service (1.7)                  |
| Limitation des durées   | Purge automatique au lancement                                                  | 1.15                              |

## Mesures de protection

Voir [`securite.md`](securite.md). En résumé : données locales par défaut, aucun script, police ou traqueur tiers, CSP stricte, chiffrement en transit et au repos côté serveur (phase 2), photos jamais envoyées, notifications génériques, export chiffré par phrase de passe prévu en 4.5.
