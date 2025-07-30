// U.S. CPI-U from 1913, monthly. Source: U.S. Bureau of Labor Statistics
// This is a subset of the full data for demonstration purposes.
export const cpiData: { [year: number]: { [month: string]: number } } = {
  2013: {
    'January': 230.28, 'February': 232.166, 'March': 232.773, 'April': 232.531,
    'May': 232.945, 'June': 233.504, 'July': 233.596, 'August': 233.877,
    'September': 234.149, 'October': 233.546, 'November': 233.069, 'December': 233.049
  },
  2014: {
    'January': 233.916, 'February': 234.781, 'March': 236.293, 'April': 237.072,
    'May': 237.9, 'June': 238.343, 'July': 238.25, 'August': 237.852,
    'September': 238.031, 'October': 237.433, 'November': 236.151, 'December': 234.812
  },
  2015: {
    'January': 233.707, 'February': 234.722, 'March': 236.119, 'April': 236.599,
    'May': 237.805, 'June': 238.638, 'July': 238.654, 'August': 238.316,
    'September': 237.945, 'October': 237.838, 'November': 237.336, 'December': 236.525
  },
  2016: {
    'January': 236.916, 'February': 237.111, 'March': 238.132, 'April': 239.261,
    'May': 240.229, 'June': 241.018, 'July': 240.628, 'August': 240.849,
    'September': 241.428, 'October': 241.729, 'November': 241.353, 'December': 241.432
  },
  2017: {
    'January': 242.839, 'February': 243.603, 'March': 243.801, 'April': 244.524,
    'May': 244.733, 'June': 244.955, 'July': 244.786, 'August': 245.519,
    'September': 246.819, 'October': 246.663, 'November': 246.669, 'December': 246.524
  },
  2018: {
    'January': 247.867, 'February': 248.991, 'March': 249.554, 'April': 250.546,
    'May': 251.588, 'June': 251.989, 'July': 252.006, 'August': 252.146,
    'September': 252.439, 'October': 252.885, 'November': 252.038, 'December': 251.233
  },
  2019: {
    'January': 251.712, 'February': 252.776, 'March': 254.202, 'April': 255.548,
    'May': 256.092, 'June': 256.143, 'July': 256.571, 'August': 256.558,
    'September': 256.759, 'October': 257.346, 'November': 257.208, 'December': 256.974
  },
  2020: {
    'January': 257.971, 'February': 258.678, 'March': 258.115, 'April': 256.389,
    'May': 256.394, 'June': 257.797, 'July': 259.101, 'August': 259.918,
    'September': 260.28, 'October': 260.388, 'November': 260.229, 'December': 260.474
  },
  2021: {
    'January': 261.582, 'February': 263.014, 'March': 264.877, 'April': 267.054,
    'May': 269.195, 'June': 271.696, 'July': 273.003, 'August': 273.567,
    'September': 274.31, 'October': 276.589, 'November': 277.948, 'December': 278.802
  },
  2022: {
    'January': 281.148, 'February': 283.716, 'March': 287.504, 'April': 289.109,
    'May': 292.296, 'June': 296.311, 'July': 296.276, 'August': 296.171,
    'September': 296.808, 'October': 298.012, 'November': 297.711, 'December': 296.797
  },
  2023: {
    'January': 299.17, 'February': 300.84, 'March': 301.836, 'April': 303.363,
    'May': 304.127, 'June': 305.109, 'July': 305.691, 'August': 307.026,
    'September': 307.789, 'October': 307.671, 'November': 307.051, 'December': 306.746
  },
  2024: {
    'January': 308.417, 'February': 310.326, 'March': 312.332, 'April': 313.548,
    'May': 314.069, 'June': 314.5, 'July': 314.5, 'August': 314.5,
    'September': 314.5, 'October': 314.5, 'November': 314.5, 'December': 314.5
  },
  2025: { // Placeholder data
    'January': 315.0, 'February': 315.0, 'March': 315.0, 'April': 315.0,
    'May': 315.0, 'June': 315.0, 'July': 315.0, 'August': 315.0,
    'September': 315.0, 'October': 315.0, 'November': 315.0, 'December': 315.0
  }
};


export const cpiDataByYear: { [year: string]: { averageCpi: number, inflationRate: string } } = {
  '2013': { averageCpi: 232.957, inflationRate: '1.5' },
  '2014': { averageCpi: 236.736, inflationRate: '1.6' },
  '2015': { averageCpi: 237.017, inflationRate: '0.1' },
  '2016': { averageCpi: 240.007, inflationRate: '1.3' },
  '2017': { averageCpi: 245.120, inflationRate: '2.1' },
  '2018': { averageCpi: 251.107, inflationRate: '2.4' },
  '2019': { averageCpi: 255.657, inflationRate: '1.8' },
  '2020': { averageCpi: 258.811, inflationRate: '1.2' },
  '2021': { averageCpi: 270.970, inflationRate: '4.7' },
  '2022': { averageCpi: 292.655, inflationRate: '8.0' },
  '2023': { averageCpi: 304.702, inflationRate: '4.1' },
  '2024': { averageCpi: 312.332, inflationRate: '2.5' }, // Data through March, rate is estimate
  '2025': { averageCpi: 315.0, inflationRate: 'N/A' }, // Placeholder
};
