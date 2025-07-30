export const taxBrackets = {
  "2024": {
    standardDeduction: {
      single: 14600,
      married_jointly: 29200,
      head_of_household: 21900,
    },
    brackets: {
      single: [
        { rate: 0.10, limit: 11600 },
        { rate: 0.12, limit: 47150 },
        { rate: 0.22, limit: 100525 },
        { rate: 0.24, limit: 191950 },
        { rate: 0.32, limit: 243725 },
        { rate: 0.35, limit: 609350 },
        { rate: 0.37, limit: Infinity },
      ],
      married_jointly: [
        { rate: 0.10, limit: 23200 },
        { rate: 0.12, limit: 94300 },
        { rate: 0.22, limit: 201050 },
        { rate: 0.24, limit: 383900 },
        { rate: 0.32, limit: 487450 },
        { rate: 0.35, limit: 731200 },
        { rate: 0.37, limit: Infinity },
      ],
      head_of_household: [
        { rate: 0.10, limit: 16550 },
        { rate: 0.12, limit: 63100 },
        { rate: 0.22, limit: 100500 },
        { rate: 0.24, limit: 191950 },
        { rate: 0.32, limit: 243700 },
        { rate: 0.35, limit: 609350 },
        { rate: 0.37, limit: Infinity },
      ],
    },
    credits: {
      childTaxCredit: 2000,
      otherDependentCredit: 500,
    },
  },
  "2025": {
    standardDeduction: {
      single: 15250,
      married_jointly: 30500,
      head_of_household: 22850,
    },
    brackets: { // These are estimated brackets. Official numbers may vary.
      single: [
        { rate: 0.10, limit: 12000 },
        { rate: 0.12, limit: 48750 },
        { rate: 0.22, limit: 104500 },
        { rate: 0.24, limit: 200000 },
        { rate: 0.32, limit: 254000 },
        { rate: 0.35, limit: 635000 },
        { rate: 0.37, limit: Infinity },
      ],
      married_jointly: [
        { rate: 0.10, limit: 24000 },
        { rate: 0.12, limit: 97500 },
        { rate: 0.22, limit: 209000 },
        { rate: 0.24, limit: 400000 },
        { rate: 0.32, limit: 508000 },
        { rate: 0.35, limit: 760000 },
        { rate: 0.37, limit: Infinity },
      ],
      head_of_household: [
        { rate: 0.10, limit: 17200 },
        { rate: 0.12, limit: 65250 },
        { rate: 0.22, limit: 104500 },
        { rate: 0.24, limit: 200000 },
        { rate: 0.32, limit: 254000 },
        { rate: 0.35, limit: 635000 },
        { rate: 0.37, limit: Infinity },
      ],
    },
     credits: {
      childTaxCredit: 2000,
      otherDependentCredit: 500,
    },
  },
};
