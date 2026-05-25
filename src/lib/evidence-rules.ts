export const EVIDENCE_RULES = {
  protein: {
    base: 1.6,
    hypertrophy: 1.8,
    highDieting: 2.2,
  },
  cardio: {
    minimumHealthMinutes: 150,
    weightLossSupportMinutes: 180,
    recoveryMinutes: 60,
  },
  surplus: {
    minimumKcal: 100,
    moderateKcal: 250,
  },
} as const;

