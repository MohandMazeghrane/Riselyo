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
    offlineReady: 'Riselyo fonctionne aussi sans connexion.',
    priorityTitle: 'Ta priorité du jour',
    priorityKept: 'Tenue',
    priorityNotKept: 'Pas cette fois',
  },
  tabs: {
    label: 'Navigation principale',
    today: 'Aujourd’hui',
    coach: 'Coach',
    progress: 'Progrès',
    reviews: 'Bilans',
    profile: 'Profil',
  },
  upcoming: {
    badge: 'Bientôt disponible',
    coach: {
      title: 'Coach',
      text: 'Ton coach pourra discuter avec toi, t’aider les jours difficiles et rédiger tes bilans. Il n’agira jamais sans ton accord.',
    },
    progress: {
      title: 'Progrès',
      text: 'Tu y verras la courbe de ton score, ton sommeil, ton humeur et tes habitudes au fil des semaines.',
    },
    reviews: {
      title: 'Bilans',
      text: 'Tous les 2-3 jours, chaque semaine et chaque mois : ce qui avance, ce qui est à éviter, ce qui est à pousser.',
    },
    meanwhile: 'En attendant, tout ton suivi continue sur l’onglet Aujourd’hui.',
  },
  profile: {
    title: 'Profil',
    privacy: 'Confidentialité',
    privacyHint: 'Choisir ce qui peut quitter ton téléphone',
    help: 'Besoin d’aide',
    helpHint: '3114, 15, 112 : des personnes à qui parler',
    habits: 'Mes habitudes',
    habitsHint: 'Paliers, ajouts et pauses',
    myData: 'Mes données',
    myDataHint: 'Exporter, sauvegarder, restaurer',
  },
  myData: {
    title: 'Mes données',
    exportTitle: 'Exporter',
    exportIntro: 'Tout ce que Riselyo garde sur ton téléphone, à télécharger quand tu veux.',
    exportBackup: 'Télécharger la sauvegarde complète (JSON)',
    exportCsv: 'Télécharger mes journées (CSV, pour un tableur)',
    exportWarning:
      'Ces fichiers contiennent tes données en clair, dont des données de santé : garde-les en lieu sûr et ne les partage pas. Une sauvegarde protégée par mot de passe arrivera plus tard.',
    exportError: 'Impossible de préparer le fichier pour l’instant. Réessaie dans un instant.',
    importTitle: 'Restaurer une sauvegarde',
    importIntro: 'Choisis un fichier de sauvegarde Riselyo (.json) exporté plus tôt.',
    importChoose: 'Choisir un fichier',
    importConfirm: (fileName: string): string =>
      `Toutes tes données actuelles seront remplacées par celles de « ${fileName} ». Pense à exporter une sauvegarde d’abord.`,
    importReplace: 'Remplacer mes données',
    importCancel: 'Annuler',
    importing: 'Restauration…',
    refusals: {
      too_large: 'Ce fichier est trop volumineux pour être une sauvegarde Riselyo.',
      not_json: 'Ce fichier n’est pas une sauvegarde Riselyo lisible.',
      not_a_backup: 'Ce fichier n’est pas une sauvegarde Riselyo.',
      newer_version:
        'Cette sauvegarde vient d’une version plus récente de Riselyo. Mets l’app à jour, puis réessaie.',
      invalid_data:
        'Cette sauvegarde contient des données abîmées ou modifiées : rien n’a été changé.',
    },
    importFailed:
      'La restauration n’a pas pu se faire : rien n’a été changé. Réessaie dans un instant.',
    eraseTitle: 'Tout supprimer',
    eraseIntro:
      'Efface de ce téléphone ton profil, tes check-ins, habitudes, mesures, roue de vie et consentements. C’est définitif : exporte une sauvegarde avant si tu veux garder une trace.',
    eraseStart: 'Tout supprimer…',
    eraseConfirmWord: 'SUPPRIMER',
    eraseConfirmLabel: 'Pour confirmer, écris SUPPRIMER',
    eraseConfirm: 'Effacer définitivement',
    eraseCancel: 'Annuler',
    erasing: 'Suppression…',
    eraseFailed: 'La suppression n’a pas pu aller jusqu’au bout. Réessaie dans un instant.',
    csv: {
      date: 'Date',
      bedtime: 'Coucher',
      wakeTime: 'Réveil',
      sleepQuality: 'Qualité du sommeil (1-5)',
      energy: 'Énergie (1-5)',
      priority: 'Priorité du jour',
      mood: 'Humeur (1-5)',
      stress: 'Stress (1-5)',
      priorityKept: 'Priorité tenue',
      victory: 'Victoire du jour',
      waterGlasses: 'Verres d’eau',
      walkMinutes: 'Minutes de marche',
      workouts: 'Séances',
      healthyMeals: 'Repas sains',
      cravingsResisted: 'Envies résistées',
    },
  },
  todayHabits: {
    title: 'Tes habitudes',
    hint: 'Touche une habitude pour noter le palier atteint aujourd’hui.',
    empty: 'Aucune habitude suivie pour l’instant.',
    manage: 'Gérer mes habitudes',
    notLogged: 'À noter',
    target: (tier: string): string => `Objectif : ${tier}`,
    daysWithout: (days: number): string => {
      if (days === 0) {
        return 'Nouveau départ';
      }
      return days === 1 ? '1 jour sans' : `${String(days)} jours sans`;
    },
    tapLabel: (habit: string, level: string): string =>
      `${habit} : ${level}. Toucher pour changer.`,
    reduceLevels: { none: 'C’est arrivé', normal: 'Journée sans' },
  },
  quick: {
    title: 'En un geste',
    limit: 'C’est le maximum pour aujourd’hui.',
    actions: {
      waterGlasses: {
        add: '+1 verre d’eau',
        remove: 'Retirer 1 verre d’eau',
        count: (value: number): string =>
          value <= 1 ? `${String(value)} verre` : `${String(value)} verres`,
      },
      walkMinutes: {
        add: '+10 min de marche',
        remove: 'Retirer 10 min de marche',
        count: (value: number): string => `${String(value)} min`,
      },
      workouts: {
        add: '+1 séance',
        remove: 'Retirer 1 séance',
        count: (value: number): string =>
          value <= 1 ? `${String(value)} séance` : `${String(value)} séances`,
      },
      healthyMeals: {
        add: 'Repas sain',
        remove: 'Retirer 1 repas sain',
        count: (value: number): string => `${String(value)} repas`,
      },
      cravingsResisted: {
        add: 'Envie résistée',
        remove: 'Retirer 1 envie résistée',
        count: (value: number): string =>
          value <= 1 ? `${String(value)} victoire` : `${String(value)} victoires`,
      },
    },
  },
  habitPlan: {
    title: 'Mes habitudes',
    activeTitle: 'Suivies en ce moment',
    noneActive: 'Aucune habitude suivie. Choisis-en une ci-dessous.',
    target: 'Palier visé',
    reduceHint: 'Compteur de jours sans',
    stop: 'Arrêter',
    confirmStop: (habit: string): string => `Arrêter « ${habit} » ? Ton historique est conservé.`,
    confirm: 'Oui, arrêter',
    cancel: 'Annuler',
    toBuildTitle: 'Habitudes à construire',
    toReduceTitle: 'Habitudes à réduire',
    toReduceHint: 'Un compteur de jours sans, et le bouton « Envie résistée » sur l’accueil.',
    add: (habit: string): string => `Ajouter « ${habit} »`,
    addShort: 'Ajouter',
    waitIntro:
      'Une nouvelle habitude s’installe mieux quand les actuelles tiennent déjà. Tu pourras en ajouter une bientôt.',
    reasons: {
      not_enough_data: (days: number, needed: number): string =>
        `Note tes habitudes encore ${String(needed - days)} soir${needed - days > 1 ? 's' : ''} : on verra alors si c’est le bon moment.`,
      low_adherence: (percent: number, needed: number): string =>
        `Cette semaine, tes habitudes tiennent à ${String(percent)} %. Une nouvelle trouvera mieux sa place à partir de ${String(needed)} %.`,
    },
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
    bannerTitle: 'Tu peux en parler maintenant',
    bannerText:
      'Ce que tu viens d’écrire a l’air lourd. Des personnes sont là pour t’écouter, gratuitement, à toute heure.',
    bannerPrivacy: 'Ce que tu écris reste sur ton téléphone.',
  },
  wellbeing: {
    title: 'On pense à toi',
    low_mood:
      'Ton humeur est basse depuis plusieurs jours. En parler à un proche ou à ton médecin peut vraiment aider.',
    high_stress:
      'Ton stress est très haut plusieurs soirs cette semaine. En parler à un proche ou à ton médecin peut vraiment aider.',
    help: 'Si c’est trop lourd, le 3114 écoute 24 h/24.',
    link: 'Voir les numéros d’aide',
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
    snacking: { label: 'Grignotage' },
    alcohol: { label: 'Alcool' },
    eveningSocialMedia: { label: 'Réseaux sociaux le soir' },
    tobacco: { label: 'Tabac' },
  },
} as const;
