export const fr = {
  appName: 'Riselyo',
  common: {
    next: 'Suivant',
    back: 'Retour',
    skip: 'Passer',
    saving: 'Enregistrement…',
    loading: 'Chargement…',
    loadError: 'Impossible de charger tes données pour l’instant.',
    saveError: 'Impossible d’enregistrer pour l’instant. Réessaie dans un instant.',
    retry: 'Réessayer',
    notAProfessional: 'Riselyo est un outil de suivi, pas un professionnel de santé.',
    needHelp: 'Besoin d’aide',
    step: (current: number, total: number): string =>
      `Étape ${String(current)} sur ${String(total)}`,
  },
  home: {
    greeting: (firstName: string): string => `Bonjour ${firstName}`,
    upcoming: 'Ton suivi du jour arrive très bientôt.',
    offlineReady: 'Riselyo fonctionne aussi sans connexion.',
    profile: 'Profil',
  },
  profile: {
    title: 'Profil',
    privacy: 'Confidentialité',
    privacyHint: 'Choisir ce qui peut quitter ton téléphone',
    help: 'Besoin d’aide',
    helpHint: '3114, 15, 112 : des personnes à qui parler',
  },
  consents: {
    onboardingTitle: 'Tes données, tes choix',
    privacyTitle: 'Confidentialité',
    intro:
      'Tout est désactivé par défaut. Active seulement ce qui te convient : tu pourras changer d’avis à tout moment dans Profil → Confidentialité.',
    localTracking:
      'Ton suivi (check-ins, habitudes, mesures) reste toujours sur ton téléphone. Il n’a pas besoin de ton accord pour fonctionner.',
    upcoming:
      'Ces fonctions arrivent dans les prochaines versions ; ton choix sera respecté dès leur arrivée.',
    confirm: 'Valider mes choix',
    journalNeedsAi: 'Active d’abord le coach IA.',
    purposes: {
      ai: {
        label: 'Coach IA',
        description:
          'Ton prénom et des résumés chiffrés (jamais tes notes brutes, photos ou mesures) sont envoyés à OpenAI via le serveur Riselyo, pour rédiger tes bilans et te répondre.',
      },
      aiJournal: {
        label: 'Journal partagé avec le coach',
        description:
          'Le texte de ton journal est aussi transmis au coach IA, pour qu’il t’aide à prendre du recul.',
      },
      health: {
        label: 'Apple Santé',
        description:
          'Sommeil, pas, minutes d’exercice, entraînements et fréquence cardiaque au repos transitent chiffrés par le serveur Riselyo (7 jours au plus), puis sont effacés.',
      },
      notifications: {
        label: 'Notifications',
        description:
          '3 rappels par jour au plus, jamais la nuit, avec un texte discret sur l’écran verrouillé.',
      },
    },
    status: {
      undecided: 'Pas encore choisi',
      granted: (date: string): string => `Activé le ${date}`,
      refused: (date: string): string => `Désactivé le ${date}`,
    },
  },
  help: {
    title: 'Besoin d’aide',
    intro: 'Si c’est difficile en ce moment, tu peux en parler maintenant à quelqu’un qui écoute.',
    lines: [
      {
        number: '3114',
        name: 'Prévention du suicide',
        detail: '24 h/24, 7 j/7, gratuit et confidentiel',
      },
      { number: '15', name: 'SAMU', detail: 'Urgence médicale' },
      {
        number: '112',
        name: 'Numéro d’urgence européen',
        detail: 'Danger immédiat, depuis n’importe quel téléphone',
      },
    ],
    call: (number: string): string => `Appeler le ${number}`,
  },
  welcome: {
    title: 'Bienvenue sur Riselyo',
    intro:
      'On va prendre une photo de ton point de départ. Pas de bonne ou de mauvaise réponse : c’est juste pour mesurer le chemin parcouru. Environ 5 minutes.',
    firstNameLabel: 'Ton prénom',
    firstNameHint: 'Seulement ton prénom, pas de nom de famille.',
    firstNameRequired: 'Indique ton prénom pour continuer.',
  },
  lifeWheel: {
    title: 'Ta roue de vie',
    intro: 'Note chaque domaine de 1 à 10, selon ce que tu ressens en ce moment.',
    remaining: (count: number): string =>
      count === 1 ? 'Encore 1 domaine à noter.' : `Encore ${String(count)} domaines à noter.`,
    scoreLabel: (domain: string, score: number): string => `${domain} : ${String(score)}`,
    domains: {
      energy: { label: 'Énergie', help: 'Comment est ton niveau d’énergie dans la journée ?' },
      mood: { label: 'Moral', help: 'Comment te sens-tu en général ces derniers temps ?' },
      sleep: { label: 'Sommeil', help: 'Est-ce que tu dors bien et assez ?' },
      fitness: { label: 'Forme physique', help: 'Comment te sens-tu dans ton corps ?' },
      nutrition: {
        label: 'Alimentation',
        help: 'Est-ce que tu manges d’une façon qui te fait du bien ?',
      },
      selfConfidence: {
        label: 'Confiance en soi',
        help: 'À quel point te fais-tu confiance en ce moment ?',
      },
      social: { label: 'Vie sociale', help: 'Es-tu satisfait de tes liens avec les autres ?' },
      organisation: {
        label: 'Organisation',
        help: 'Arrives-tu à tenir tes journées comme tu le voudrais ?',
      },
    },
    resultTitle: 'Ton point de départ',
    resultText: 'Voilà ton point de départ. On refera ce bilan dans 30 jours.',
    radarLabel: 'Roue de vie : tes notes sur les 8 domaines',
  },
  measurements: {
    title: 'Tes mesures',
    intro: 'Tout est facultatif. Remplis ce que tu veux, ou passe.',
    privacy: 'Ces données restent sur ton téléphone et ne sont jamais envoyées à l’IA.',
    body: 'Corps',
    fitness: 'Tests de forme',
    weightKg: 'Poids (kg)',
    waistCm: 'Tour de taille (cm)',
    pushUps: 'Pompes d’affilée',
    plankSeconds: 'Gainage (secondes)',
    brisk1km: '1 km de marche rapide',
    minutes: 'min',
    seconds: 's',
    invalid: 'Une valeur semble incorrecte. Vérifie-la, ou laisse le champ vide.',
  },
  rhythm: {
    title: 'Ton rythme',
    wakeTime: 'Heure de réveil habituelle (semaine)',
    bedtime: 'Heure de coucher cible',
    sleepTarget: 'Durée de sommeil cible',
    hours: 'heures',
    minutes: 'minutes',
    eveningCheckIn: 'Heure du check-in du soir',
    sportDays: 'Jours possibles pour le sport',
    warnings: {
      too_short:
        'Moins de 5 h de sommeil, c’est peu. Vérifie tes horaires ; tu peux continuer quand même.',
      too_long:
        'Plus de 11 h de sommeil, c’est beaucoup. Vérifie tes horaires ; tu peux continuer quand même.',
    },
    weekdays: {
      mon: { short: 'L', long: 'Lundi' },
      tue: { short: 'M', long: 'Mardi' },
      wed: { short: 'M', long: 'Mercredi' },
      thu: { short: 'J', long: 'Jeudi' },
      fri: { short: 'V', long: 'Vendredi' },
      sat: { short: 'S', long: 'Samedi' },
      sun: { short: 'D', long: 'Dimanche' },
    },
    invalid: 'Vérifie les heures et la durée de sommeil.',
  },
  why: {
    title: 'Ton « pourquoi »',
    label: 'Je veux me reprendre en main parce que…',
    hint: 'Facultatif, mais il t’aidera les jours difficiles.',
    counter: (used: number, max: number): string => `${String(used)} / ${String(max)}`,
  },
  checkIn: {
    morningTitle: 'Check-in du matin',
    eveningTitle: 'Check-in du soir',
    done: 'Fait',
    toDo: 'À faire',
    redo: 'Modifier',
    save: 'Valider',
    invalid: 'Il manque une réponse : touche une valeur pour chaque question.',
    bedtime: 'Heure de coucher',
    wakeTime: 'Heure de réveil',
    slept: (hours: number, minutes: number): string =>
      `Environ ${String(hours)} h ${String(minutes).padStart(2, '0')} de sommeil`,
    sleepQuality: 'Qualité du sommeil',
    sleepQualityHint: '1 = très mauvaise, 5 = excellente',
    energy: 'Énergie',
    energyHint: '1 = à plat, 5 = pleine forme',
    priority: 'Ta priorité du jour',
    priorityHint: 'Une seule action, facultative.',
    priorityFree: 'Autre chose',
    priorityFreeLabel: 'Ta priorité',
    priorityNone: 'Pas de priorité aujourd’hui',
    mood: 'Ton humeur',
    moods: ['Très mal', 'Pas terrible', 'Neutre', 'Bien', 'Très bien'],
    stress: 'Ton stress',
    stressHint: '1 = calme, 5 = très stressé',
    habitsTitle: 'Tes habitudes du jour',
    levels: { none: 'Pas fait', min: 'Minimum', normal: 'Normal', excellent: 'Excellent' },
    priorityKept: (priority: string): string => `As-tu tenu ta priorité : « ${priority} » ?`,
    yes: 'Oui',
    no: 'Non',
    victory: 'Ta victoire du jour (facultatif)',
    victoryHint: 'Une ligne, même petite : elle compte.',
  },
  goals: {
    title: 'Tes 3 premiers objectifs',
    intro: 'Choisis jusqu’à 3 habitudes. Chacune démarre au plus petit palier.',
    tooMany:
      'Trois pour commencer, c’est l’idéal. Tu pourras en ajouter quand ceux-là seront bien installés.',
    startWith: (tier: string): string => `Pour commencer : ${tier}`,
    finish: 'C’est parti',
  },
  habits: {
    walk: { label: 'Marcher', min: '10 min', normal: '30 min', excellent: '60 min' },
    workout: {
      label: 'Séance de sport',
      min: '10 min au poids du corps',
      normal: '30 min',
      excellent: '45 min + étirements',
    },
    regularBedtime: {
      label: 'Coucher régulier',
      min: '± 1 h de la cible',
      normal: '± 30 min',
      excellent: '± 15 min',
    },
    water: { label: 'Boire de l’eau', min: '4 verres', normal: '6 verres', excellent: '8 verres' },
    noScreenInBed: {
      label: 'Pas d’écran au lit',
      min: '15 min avant',
      normal: '30 min avant',
      excellent: '60 min avant',
    },
    breathing: {
      label: 'Respiration / méditation',
      min: '2 min',
      normal: '5 min',
      excellent: '10 min',
    },
    tidy: { label: 'Ranger chez soi', min: '5 min', normal: '15 min', excellent: '30 min' },
    read: { label: 'Lire', min: '5 pages', normal: '15 pages', excellent: '30 pages' },
    socialContact: {
      label: 'Contact social',
      min: 'un message',
      normal: 'un appel',
      excellent: 'une sortie',
    },
    noAlcohol: {
      label: 'Pas d’alcool',
      min: '',
      normal: 'journée sans',
      excellent: 'semaine sans',
    },
  },
} as const;
