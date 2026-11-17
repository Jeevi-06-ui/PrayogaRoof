/**
 * Chemical Kinetics Scientific Model
 * Curriculum: CBSE Class 12 Chemistry Practical (Effect of Concentration and Temperature on Reaction Rate)
 * 
 * Reaction:
 * Na2S2O3(aq) + 2HCl(aq) -> 2NaCl(aq) + SO2(g) + S(s)v + H2O(l)
 * 
 * Key Principles:
 * 1. Colloidal Sulphur Turbidity: The reaction produces insoluble elemental sulphur in colloidal state.
 * 2. Visual Cross Method: The reaction vessel sits on a white tile with a bold black cross (+).
 *    As sulphur accumulates, turbidity increases until the cross becomes completely invisible from above.
 * 3. Rate Law: Rate = k * [Na2S2O3]^m * [HCl]^n. With [HCl] in excess, Rate = 1/t = k' * [Na2S2O3]^1 (First order).
 * 4. Arrhenius Temperature Dependence: k = A * exp(-Ea / RT), doubling roughly every 10°C rise.
 */

export interface KineticsParams {
  stockThiosulphateM?: number; // default 0.10 M
  volumeThiosulphateMl: number; // e.g. 10 to 50 mL
  volumeWaterMl: number; // e.g. 0 to 40 mL (total thio+water = 50 mL)
  volumeHclMl: number; // typically 10 mL of 1.0M HCl
  temperatureC?: number; // default 25.0°C
  elapsedSeconds: number; // timer progress
  isReactionStarted: boolean;
}

export interface KineticsPoint {
  flaskId: string;
  volumeThioMl: number;
  volumeWaterMl: number;
  concentrationM: number;
  timeSec: number;
  ratePerSec: number; // 1 / t
}

export interface KineticsState {
  effectiveThioM: number;
  effectiveHclM: number;
  totalVolumeMl: number;
  temperatureC: number;
  elapsedSeconds: number;
  timeToObscureSec: number;
  ratePerSec: number; // 1 / t_obscure
  turbidityPercent: number; // 0 to 100%
  crossObscured: boolean;
  crossVisibilityPercent: number; // 100% down to 0%
  observationStatus: string;
  solutionColor: string;
  sulphurPrecipitateGrams: number;
  standardSeries: KineticsPoint[];
  assumptions: string[];
}

export const KINETICS_ASSUMPTIONS = [
  'Critical mass of colloidal sulphur required to obscure the black cross mark is constant across all runs.',
  'Reaction rate is inversely proportional to time taken for cross obscuration: Rate = 1 / t.',
  'Hydrochloric acid is maintained in stoichiometric excess; reaction order with respect to [Na₂S₂O₃] is first-order (m = 1).',
  'Temperature remains isothermal during each measurement run.',
  'Arrhenius activation energy Ea ≈ 50.0 kJ/mol governs the temperature dependence.',
];

const GAS_CONSTANT = 8.314; // J/(mol*K)
const EA_JOULES = 50000; // 50 kJ/mol
const REFERENCE_TEMP_K = 298.15; // 25°C

/**
 * Arrhenius temperature scaling factor relative to 25°C
 */
export function calculateTemperatureFactor(tempC: number): number {
  const tempK = tempC + 273.15;
  const factor = Math.exp((-EA_JOULES / GAS_CONSTANT) * (1 / tempK - 1 / REFERENCE_TEMP_K));
  return Math.max(0.2, Math.min(10.0, factor));
}

/**
 * Calculates chemical kinetics state for the reaction
 */
export function calculateKineticsState(params: KineticsParams): KineticsState {
  const stockM = Math.max(0.01, params.stockThiosulphateM ?? 0.10);
  const vThio = Math.max(0, params.volumeThiosulphateMl);
  const vWater = Math.max(0, params.volumeWaterMl);
  const vHcl = Math.max(0.1, params.volumeHclMl ?? 10.0);
  const totalVolumeMl = vThio + vWater + vHcl;
  const tempC = Math.max(10, Math.min(80, params.temperatureC ?? 25.0));
  const elapsed = Math.max(0, params.elapsedSeconds);
  const isStarted = Boolean(params.isReactionStarted);

  // Effective initial concentrations in the reaction mixture
  const effectiveThioM = Number(((vThio * stockM) / totalVolumeMl).toFixed(4));
  const effectiveHclM = Number(((vHcl * 1.0) / totalVolumeMl).toFixed(4));

  // Temperature acceleration factor
  const tempFactor = calculateTemperatureFactor(tempC);

  // Calibration: At 25°C, 50 mL 0.1M thio + 10 mL HCl (effThio = 0.0833 M) gives t_obscure = 16.0 s
  // Rate = 1/t = k * [Thio] * tempFactor
  // k_base = (1/16.0) / 0.08333 ≈ 0.75 L/(mol*s)
  const kBase = 0.75;
  const rateK = kBase * tempFactor;

  let timeToObscureSec = 999;
  let ratePerSec = 0;

  if (effectiveThioM > 0.001) {
    ratePerSec = Number((rateK * effectiveThioM).toFixed(4));
    timeToObscureSec = Number((1.0 / ratePerSec).toFixed(1));
  }

  // Cross visibility & turbidity calculation
  let turbidityPercent = 0;
  let crossVisibilityPercent = 100;
  let crossObscured = false;
  let observationStatus = 'Reaction not started. White cross is clearly visible through water.';
  let solutionColor = 'rgba(240, 249, 255, 0.4)'; // Clear water
  let sulphurPrecipitateGrams = 0;

  if (isStarted && effectiveThioM > 0.001) {
    turbidityPercent = Math.min(100, Number(((elapsed / timeToObscureSec) * 100).toFixed(1)));
    crossVisibilityPercent = Math.max(0, Number((100 - turbidityPercent).toFixed(1)));
    crossObscured = elapsed >= timeToObscureSec;

    // Mass of colloidal sulphur formed: Na2S2O3 + 2HCl -> S (MW = 32.06 g/mol)
    const molesThioReacted = Math.min(
      (effectiveThioM * totalVolumeMl) / 1000,
      ((effectiveThioM * totalVolumeMl) / 1000) * (elapsed / timeToObscureSec)
    );
    sulphurPrecipitateGrams = Number((molesThioReacted * 32.06).toFixed(4));

    if (crossObscured) {
      observationStatus = `CRITICAL ENDPOINT REACHED: Black cross mark completely obscured by milky colloidal sulphur at t = ${timeToObscureSec} s (Rate = ${ratePerSec} s⁻¹).`;
      solutionColor = 'rgba(254, 240, 138, 0.95)'; // Dense milky-yellow colloidal sulphur
    } else {
      const alpha = 0.2 + 0.75 * (turbidityPercent / 100);
      solutionColor = `rgba(254, 240, 138, ${alpha.toFixed(2)})`;
      observationStatus = `Reaction in progress (${elapsed.toFixed(1)} s / ${timeToObscureSec} s). Opalescence increasing; cross visibility is ${crossVisibilityPercent}%.`;
    }
  }

  // Standard NCERT experimental 5-flask series data for graphing
  const standardSeries: KineticsPoint[] = [
    { flaskId: 'A', volumeThioMl: 50, volumeWaterMl: 0, concentrationM: 0.0833, timeSec: Number((16.0 / tempFactor).toFixed(1)), ratePerSec: Number((0.0625 * tempFactor).toFixed(4)) },
    { flaskId: 'B', volumeThioMl: 40, volumeWaterMl: 10, concentrationM: 0.0667, timeSec: Number((20.0 / tempFactor).toFixed(1)), ratePerSec: Number((0.0500 * tempFactor).toFixed(4)) },
    { flaskId: 'C', volumeThioMl: 30, volumeWaterMl: 20, concentrationM: 0.0500, timeSec: Number((26.7 / tempFactor).toFixed(1)), ratePerSec: Number((0.0375 * tempFactor).toFixed(4)) },
    { flaskId: 'D', volumeThioMl: 20, volumeWaterMl: 30, concentrationM: 0.0333, timeSec: Number((40.0 / tempFactor).toFixed(1)), ratePerSec: Number((0.0250 * tempFactor).toFixed(4)) },
    { flaskId: 'E', volumeThioMl: 10, volumeWaterMl: 40, concentrationM: 0.0167, timeSec: Number((80.0 / tempFactor).toFixed(1)), ratePerSec: Number((0.0125 * tempFactor).toFixed(4)) },
  ];

  return {
    effectiveThioM,
    effectiveHclM,
    totalVolumeMl,
    temperatureC: tempC,
    elapsedSeconds: elapsed,
    timeToObscureSec,
    ratePerSec,
    turbidityPercent,
    crossObscured,
    crossVisibilityPercent,
    observationStatus,
    solutionColor,
    sulphurPrecipitateGrams,
    standardSeries,
    assumptions: KINETICS_ASSUMPTIONS,
  };
}
