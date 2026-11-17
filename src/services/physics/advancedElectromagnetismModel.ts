/**
 * PrayogaProof - Advanced Electromagnetism & Metrology Model
 *
 * Headless, deterministic physical models for Class 12 Physics Experiments:
 * 1. Resistivity of a Wire Using the V-I Method (R = V/I, rho = R * A / L)
 * 2. Metre Bridge – Unknown Resistance (Wheatstone bridge null condition: X = R * (100 - l) / l)
 * 3. Galvanometer Resistance and Figure of Merit (Half-deflection method: G = R*S/(R-S), k = E / ((R+G)*theta))
 * 4. Conversion of Galvanometer into a Voltmeter (Series multiplier: Rs = (V / Ig) - G)
 * 5. Conversion of Galvanometer into an Ammeter (Parallel shunt: S = (Ig * G) / (I - Ig))
 */

// ============================================================================
// 1. Resistivity of a Wire Using the V-I Method
// ============================================================================

export type WireMaterial = 'constantan' | 'nichrome' | 'manganin' | 'copper';

export interface WireMaterialProperties {
  name: string;
  standardResistivityOhmMeter: number; // rho at 20 C
  temperatureCoefficientPerKelvin: number; // alpha
}

export const WIRE_MATERIAL_PRESETS: Record<WireMaterial, WireMaterialProperties> = {
  constantan: {
    name: 'Constantan (Eureka: 55% Cu, 45% Ni)',
    standardResistivityOhmMeter: 4.9e-7, // 4.9 x 10^-7 Ohm*m
    temperatureCoefficientPerKelvin: 0.00001, // exceptionally low alpha
  },
  nichrome: {
    name: 'Nichrome (80% Ni, 20% Cr)',
    standardResistivityOhmMeter: 1.1e-6, // 1.1 x 10^-6 Ohm*m
    temperatureCoefficientPerKelvin: 0.0004,
  },
  manganin: {
    name: 'Manganin (84% Cu, 12% Mn, 4% Ni)',
    standardResistivityOhmMeter: 4.4e-7, // 4.4 x 10^-7 Ohm*m
    temperatureCoefficientPerKelvin: 0.00001,
  },
  copper: {
    name: 'Commercial Copper Wire',
    standardResistivityOhmMeter: 1.7e-8, // 1.7 x 10^-8 Ohm*m
    temperatureCoefficientPerKelvin: 0.00393,
  },
};

export interface WireResistivityParams {
  material: WireMaterial;
  wireLengthCm: number; // Specimen length L in cm (e.g. 50 - 150 cm)
  wireDiameterMm: number; // Diameter d measured by screw gauge (e.g. 0.20 - 1.00 mm)
  appliedVoltageVolts: number; // DC voltage across wire (e.g. 0.5 - 5.0 V)
  temperatureC?: number; // Ambient temperature (default 25 C)
}

export interface WireResistivityResult {
  materialName: string;
  wireLengthMeters: number;
  wireDiameterMeters: number;
  crossSectionalAreaM2: number; // A = pi * (d/2)^2
  theoreticalResistanceOhms: number; // R = rho * L / A
  measuredCurrentAmps: number; // I = V / R
  measuredVoltageVolts: number;
  calculatedResistanceOhms: number; // R_calc = V / I
  calculatedResistivityOhmMeter: number; // rho_calc = R * A / L
  standardResistivityOhmMeter: number;
  percentageError: number;
  isValidDimensions: boolean;
}

/**
 * Calculates wire resistance, circuit current, and resistivity from physical geometry.
 * Formula: R = rho * L / A = 4 * rho * L / (pi * d^2)
 * rho = R * A / L = (V / I) * (pi * d^2) / (4 * L)
 */
export function calculateWireResistivity(params: WireResistivityParams): WireResistivityResult {
  const matProp = WIRE_MATERIAL_PRESETS[params.material] || WIRE_MATERIAL_PRESETS.constantan;
  const lengthM = Math.max(0.1, params.wireLengthCm / 100);
  const diameterM = Math.max(0.05e-3, params.wireDiameterMm * 1e-3);
  const voltageV = Math.max(0, params.appliedVoltageVolts);

  // Cross-sectional area A = pi * (d/2)^2
  const areaM2 = (Math.PI * diameterM * diameterM) / 4;

  // Temperature correction: rho(T) = rho_0 * [1 + alpha * (T - 20)]
  const tempC = params.temperatureC ?? 25.0;
  const actualResistivity = matProp.standardResistivityOhmMeter * (1 + matProp.temperatureCoefficientPerKelvin * (tempC - 20));

  // Theoretical resistance R = rho * L / A
  const resistanceOhms = (actualResistivity * lengthM) / areaM2;

  // Current through the wire under applied voltage
  const currentAmps = resistanceOhms > 0 ? voltageV / resistanceOhms : 0;

  // Back-calculate from circuit readings (simulating real lab measurement)
  const calcResistance = currentAmps > 0 ? voltageV / currentAmps : resistanceOhms;
  const calcResistivity = (calcResistance * areaM2) / lengthM;

  const percentageError = Math.abs((calcResistivity - matProp.standardResistivityOhmMeter) / matProp.standardResistivityOhmMeter) * 100;

  return {
    materialName: matProp.name,
    wireLengthMeters: Number(lengthM.toFixed(4)),
    wireDiameterMeters: Number(diameterM.toFixed(6)),
    crossSectionalAreaM2: Number(areaM2.toExponential(4)),
    theoreticalResistanceOhms: Number(resistanceOhms.toFixed(3)),
    measuredCurrentAmps: Number(currentAmps.toFixed(4)),
    measuredVoltageVolts: Number(voltageV.toFixed(3)),
    calculatedResistanceOhms: Number(calcResistance.toFixed(3)),
    calculatedResistivityOhmMeter: Number(calcResistivity.toExponential(4)),
    standardResistivityOhmMeter: matProp.standardResistivityOhmMeter,
    percentageError: Number(percentageError.toFixed(2)),
    isValidDimensions: params.wireLengthCm >= 20 && params.wireDiameterMm >= 0.1,
  };
}

// ============================================================================
// 2. Metre Bridge – Unknown Resistance
// ============================================================================

export interface MetreBridgeParams {
  knownResistanceR: number; // Resistance in Left Gap (Ohms, e.g. 1 - 50 Ohm)
  unknownResistanceX: number; // Resistance in Right Gap (Ohms, e.g. 2 - 40 Ohm)
  jockeyPositionCm: number; // Jockey touch position on 100 cm wire (e.g. 10 - 90 cm)
  supplyVoltageVolts?: number; // Battery voltage (default 2.0 V)
  wireResistancePerCm?: number; // Metre bridge wire resistance per cm (default 0.05 Ohm/cm = 5 Ohm total)
}

export interface MetreBridgeResult {
  knownResistanceR: number;
  unknownResistanceX: number;
  nullBalanceLengthCm: number; // l_null where galvanometer deflection is 0
  jockeyPositionCm: number;
  isBalanced: boolean; // |jockey - nullLength| <= 0.1 cm
  galvanometerDeflectionDivisions: number; // -30 to +30 scale deflection
  galvanometerVoltageMv: number; // Potential difference across G in mV
  calculatedUnknownX: number; // X_calc = R * (100 - l) / l
  percentageError: number;
  balanceStatus: 'null-balanced' | 'deflected-left' | 'deflected-right' | 'invalid-geometry';
}

/**
 * Models the Wheatstone Metre Bridge network.
 * Balance condition: R / X = l / (100 - l)  =>  X = R * (100 - l) / l
 * When jockey position l != l_null, the galvanometer indicates deflection proportional to V_G.
 */
export function calculateMetreBridge(params: MetreBridgeParams): MetreBridgeResult {
  const r = Math.max(0.1, params.knownResistanceR);
  const x = Math.max(0.1, params.unknownResistanceX);
  const jockeyPos = Math.max(1.0, Math.min(99.0, params.jockeyPositionCm));
  const supplyV = params.supplyVoltageVolts ?? 2.0;

  // Theoretical null balance length:
  // l_null / (100 - l_null) = R / X  =>  l_null * X = R * (100 - l_null)
  // l_null * (R + X) = 100 * R  =>  l_null = (100 * R) / (R + X)
  const nullBalanceLengthCm = (100.0 * r) / (r + x);

  // Check if current jockey position is at the null point
  const deltaL = jockeyPos - nullBalanceLengthCm;
  const isBalanced = Math.abs(deltaL) <= 0.15; // Within 1.5 mm tolerance

  // Potential difference across the galvanometer branch:
  // V_D = supplyV * (r / (r + x)) = supplyV * (nullBalanceLengthCm / 100)
  // V_J = supplyV * (jockeyPos / 100)
  // V_G = V_D - V_J = supplyV * (nullBalanceLengthCm - jockeyPos) / 100
  const vG = supplyV * (nullBalanceLengthCm - jockeyPos) / 100.0;
  const galvanometerVoltageMv = vG * 1000.0;

  // Galvanometer scale: 30-0-30 divisions.
  // 1 division corresponds to approx 1.0 mV across galvanometer terminals
  const rawDeflection = Math.round(galvanometerVoltageMv / 1.5);
  const deflection = Math.max(-30, Math.min(30, rawDeflection));

  // Calculated unknown resistance from student's jockey position
  const calcX = (r * (100.0 - jockeyPos)) / jockeyPos;
  const percentageError = Math.abs((calcX - x) / x) * 100.0;

  let balanceStatus: 'null-balanced' | 'deflected-left' | 'deflected-right' | 'invalid-geometry';
  if (isBalanced) {
    balanceStatus = 'null-balanced';
  } else if (deflection < 0) {
    balanceStatus = 'deflected-left';
  } else {
    balanceStatus = 'deflected-right';
  }

  return {
    knownResistanceR: Number(r.toFixed(2)),
    unknownResistanceX: Number(x.toFixed(2)),
    nullBalanceLengthCm: Number(nullBalanceLengthCm.toFixed(2)),
    jockeyPositionCm: Number(jockeyPos.toFixed(1)),
    isBalanced,
    galvanometerDeflectionDivisions: isBalanced ? 0 : deflection,
    galvanometerVoltageMv: Number(galvanometerVoltageMv.toFixed(2)),
    calculatedUnknownX: Number(calcX.toFixed(2)),
    percentageError: Number(percentageError.toFixed(2)),
    balanceStatus,
  };
}

// ============================================================================
// 3. Galvanometer Resistance and Figure of Merit
// ============================================================================

export interface GalvanometerFomParams {
  galvanometerTrueResistanceG: number; // Coil resistance G (e.g. 50 - 100 Ohm)
  figureOfMeritK: number; // Figure of merit k (e.g. 2.0e-5 A/div = 20 uA/div)
  scaleDivisionsN?: number; // Total scale divisions on one side (default 30 div)
  highResistanceBoxR: number; // High series resistance R (e.g. 2000 - 10000 Ohm)
  lowShuntResistanceS: number; // Low parallel shunt S (e.g. 30 - 150 Ohm)
  isShuntKeyClosed: boolean; // Key K2 across shunt
  batteryEmfVolts?: number; // Supply EMF (default 2.0 V)
}

export interface GalvanometerFomResult {
  fullDeflectionThetaDivisions: number; // Theta when shunt key K2 is OPEN
  halfDeflectionThetaPrimeDivisions: number; // Theta' when shunt key K2 is CLOSED
  isHalfDeflectionReached: boolean; // Theta' == round(Theta / 2)
  calculatedGalvanometerResistanceG: number; // G_calc = R * S / (R - S)
  calculatedFigureOfMeritK: number; // k_calc = E / ((R + G_calc) * Theta)
  percentageErrorG: number;
  percentageErrorK: number;
  fullScaleCurrentMicroAmps: number; // Ig = N * k in uA
  galvanometerCurrentMicroAmps: number;
}

/**
 * Evaluates the Half-Deflection Method for Galvanometer Resistance and Figure of Merit.
 * Full deflection (K2 open): I = E / (R + G) = k * theta
 * Shunt closed (K2 closed): I_g' = (E * S) / [R(G + S) + GS] = k * theta'
 * When theta' = theta / 2: G = (R * S) / (R - S)
 * Figure of merit k = E / [(R + G) * theta]
 */
export function calculateGalvanometerFom(params: GalvanometerFomParams): GalvanometerFomResult {
  const gTrue = Math.max(10.0, params.galvanometerTrueResistanceG);
  const kTrue = Math.max(1e-6, params.figureOfMeritK);
  const nScale = params.scaleDivisionsN ?? 30;
  const rHigh = Math.max(500.0, params.highResistanceBoxR);
  const sLow = Math.max(1.0, params.lowShuntResistanceS);
  const emf = params.batteryEmfVolts ?? 2.0;

  // 1. Initial full deflection theta with K1 closed, K2 OPEN:
  // Current I = E / (R + G)
  const currentOpen = emf / (rHigh + gTrue);
  const rawTheta = currentOpen / kTrue;
  const fullDeflectionThetaDivisions = Math.max(0, Math.min(nScale, Math.round(rawTheta)));

  // 2. Deflection theta' when shunt key K2 is CLOSED:
  // I_g' = (E * S) / [R * (G + S) + G * S]
  const currentWithShunt = (emf * sLow) / (rHigh * (gTrue + sLow) + gTrue * sLow);
  const rawThetaPrime = currentWithShunt / kTrue;
  const halfDeflectionThetaPrimeDivisions = params.isShuntKeyClosed
    ? Math.max(0, Math.min(nScale, Math.round(rawThetaPrime)))
    : fullDeflectionThetaDivisions;

  // Check if deflection is halved
  const targetHalf = Math.round(fullDeflectionThetaDivisions / 2);
  const isHalfDeflectionReached = params.isShuntKeyClosed && halfDeflectionThetaPrimeDivisions === targetHalf;

  // Calculated G from half-deflection formula: G = R * S / (R - S)
  const calcG = rHigh > sLow ? (rHigh * sLow) / (rHigh - sLow) : gTrue;
  const percentageErrorG = Math.abs((calcG - gTrue) / gTrue) * 100.0;

  // Calculated figure of merit k = E / [(R + G) * theta]
  const calcK = fullDeflectionThetaDivisions > 0 ? emf / ((rHigh + calcG) * fullDeflectionThetaDivisions) : kTrue;
  const percentageErrorK = Math.abs((calcK - kTrue) / kTrue) * 100.0;

  const currentDisplay = params.isShuntKeyClosed ? currentWithShunt : currentOpen;

  return {
    fullDeflectionThetaDivisions,
    halfDeflectionThetaPrimeDivisions,
    isHalfDeflectionReached,
    calculatedGalvanometerResistanceG: Number(calcG.toFixed(2)),
    calculatedFigureOfMeritK: Number(calcK.toExponential(4)),
    percentageErrorG: Number(percentageErrorG.toFixed(2)),
    percentageErrorK: Number(percentageErrorK.toFixed(2)),
    fullScaleCurrentMicroAmps: Number((nScale * kTrue * 1e6).toFixed(1)),
    galvanometerCurrentMicroAmps: Number((currentDisplay * 1e6).toFixed(2)),
  };
}

// ============================================================================
// 4. Conversion of Galvanometer into a Voltmeter
// ============================================================================

export interface GalvanometerToVoltmeterParams {
  galvanometerResistanceG: number; // Coil resistance G in Ohms (e.g. 50 - 100 Ohm)
  figureOfMeritK: number; // Figure of merit k (e.g. 2.0e-5 A/div)
  scaleDivisionsN?: number; // Total scale divisions (default 30)
  targetMaxVoltageRangeVolts: number; // Desired full-scale range V (e.g. 3.0 V or 5.0 V)
  installedSeriesResistanceRs: number; // Series resistor connected by student (Ohms)
  appliedTestVoltageVolts: number; // Voltage applied across converted meter (0 to target)
}

export interface GalvanometerToVoltmeterResult {
  fullScaleCurrentIgAmps: number; // Ig = N * k
  requiredSeriesResistanceRs: number; // Theoretical Rs = (V / Ig) - G
  installedSeriesResistanceRs: number;
  totalMeterResistanceOhms: number; // R_meter = Rs + G
  isCorrectMultiplier: boolean; // |installed - required| <= 1%
  appliedTestVoltageVolts: number;
  galvanometerDeflectionDivisions: number; // theta = clamp(0, 30, (V_applied / (Rs + G)) / k)
  measuredVoltageVolts: number; // V_meas = (theta / N) * V_range
  voltageErrorVolts: number; // V_meas - V_applied
  isOverloaded: boolean; // V_applied > V_range
}

/**
 * Calculates conversion of a moving-coil galvanometer into a voltmeter.
 * Formula: Rs = (V_target / I_g) - G  where I_g = N * k
 * Current through meter: I = V_applied / (Rs + G)
 * Deflection: theta = I / k
 */
export function calculateGalvanometerToVoltmeter(params: GalvanometerToVoltmeterParams): GalvanometerToVoltmeterResult {
  const g = Math.max(10.0, params.galvanometerResistanceG);
  const k = Math.max(1e-6, params.figureOfMeritK);
  const n = params.scaleDivisionsN ?? 30;
  const targetV = Math.max(0.5, params.targetMaxVoltageRangeVolts);
  const installedRs = Math.max(0, params.installedSeriesResistanceRs);
  const appliedV = Math.max(0, params.appliedTestVoltageVolts);

  // Full-scale current Ig
  const fullScaleCurrentIgAmps = n * k;

  // Required series multiplier resistance: Rs = (V / Ig) - G
  const requiredSeriesResistanceRs = targetV / fullScaleCurrentIgAmps - g;

  // Check if student's multiplier is within 1% of theoretical
  const isCorrectMultiplier = Math.abs(installedRs - requiredSeriesResistanceRs) / requiredSeriesResistanceRs <= 0.015;

  const totalMeterResistanceOhms = installedRs + g;

  // Actual current flowing through the converted voltmeter
  const meterCurrent = totalMeterResistanceOhms > 0 ? appliedV / totalMeterResistanceOhms : 0;

  // Scale deflection in divisions
  const rawDeflection = meterCurrent / k;
  const isOverloaded = appliedV > targetV * 1.05 || rawDeflection > n;
  const galvanometerDeflectionDivisions = Math.max(0, Math.min(n, Math.round(rawDeflection)));

  // Measured voltage based on scale deflection
  const measuredVoltageVolts = (galvanometerDeflectionDivisions / n) * targetV;
  const voltageErrorVolts = measuredVoltageVolts - appliedV;

  return {
    fullScaleCurrentIgAmps: Number(fullScaleCurrentIgAmps.toFixed(6)),
    requiredSeriesResistanceRs: Number(requiredSeriesResistanceRs.toFixed(1)),
    installedSeriesResistanceRs: Number(installedRs.toFixed(1)),
    totalMeterResistanceOhms: Number(totalMeterResistanceOhms.toFixed(1)),
    isCorrectMultiplier,
    appliedTestVoltageVolts: Number(appliedV.toFixed(2)),
    galvanometerDeflectionDivisions,
    measuredVoltageVolts: Number(measuredVoltageVolts.toFixed(2)),
    voltageErrorVolts: Number(voltageErrorVolts.toFixed(3)),
    isOverloaded,
  };
}

// ============================================================================
// 5. Conversion of Galvanometer into an Ammeter
// ============================================================================

export interface GalvanometerToAmmeterParams {
  galvanometerResistanceG: number; // Coil resistance G in Ohms (e.g. 50 - 100 Ohm)
  figureOfMeritK: number; // Figure of merit k (e.g. 2.0e-5 A/div)
  scaleDivisionsN?: number; // Total scale divisions (default 30)
  targetMaxCurrentRangeAmps: number; // Desired full-scale range I (e.g. 1.0 A or 3.0 A)
  installedShuntResistanceS: number; // Shunt resistor connected in parallel (Ohms)
  appliedCircuitCurrentAmps: number; // Current flowing in circuit (0 to target)
}

export interface GalvanometerToAmmeterResult {
  fullScaleCurrentIgAmps: number; // Ig = N * k
  requiredShuntResistanceS: number; // Theoretical S = (Ig * G) / (I - Ig)
  installedShuntResistanceS: number;
  totalAmmeterResistanceOhms: number; // R_ammeter = (G * S) / (G + S)
  isCorrectShunt: boolean; // |installed - required| <= 2%
  appliedCircuitCurrentAmps: number;
  galvanometerDeflectionDivisions: number; // theta = clamp(0, 30, (I_coil / k))
  measuredCurrentAmps: number; // I_meas = (theta / N) * I_range
  currentErrorAmps: number; // I_meas - I_applied
  isOverloaded: boolean; // I_applied > I_range
}

/**
 * Calculates conversion of a moving-coil galvanometer into an ammeter.
 * Formula: S = (I_g * G) / (I_target - I_g)
 * Current through coil: I_coil = I_circuit * (S / (G + S))
 * Deflection: theta = I_coil / k
 */
export function calculateGalvanometerToAmmeter(params: GalvanometerToAmmeterParams): GalvanometerToAmmeterResult {
  const g = Math.max(10.0, params.galvanometerResistanceG);
  const k = Math.max(1e-6, params.figureOfMeritK);
  const n = params.scaleDivisionsN ?? 30;
  const targetI = Math.max(0.1, params.targetMaxCurrentRangeAmps);
  const installedS = Math.max(0.001, params.installedShuntResistanceS);
  const circuitI = Math.max(0, params.appliedCircuitCurrentAmps);

  // Full-scale current Ig
  const fullScaleCurrentIgAmps = n * k;

  // Required shunt resistance: S = (Ig * G) / (I - Ig)
  const requiredShuntResistanceS = (fullScaleCurrentIgAmps * g) / (targetI - fullScaleCurrentIgAmps);

  // Check if student's shunt is within 2% of theoretical
  const isCorrectShunt = Math.abs(installedS - requiredShuntResistanceS) / requiredShuntResistanceS <= 0.02;

  // Total internal resistance of converted ammeter
  const totalAmmeterResistanceOhms = (g * installedS) / (g + installedS);

  // Current dividing into the galvanometer coil:
  // I_coil = I_circuit * (S / (G + S))
  const coilCurrent = circuitI * (installedS / (g + installedS));

  // Scale deflection in divisions
  const rawDeflection = coilCurrent / k;
  const isOverloaded = circuitI > targetI * 1.05 || rawDeflection > n;
  const galvanometerDeflectionDivisions = Math.max(0, Math.min(n, Math.round(rawDeflection)));

  // Measured current based on scale deflection
  const measuredCurrentAmps = (galvanometerDeflectionDivisions / n) * targetI;
  const currentErrorAmps = measuredCurrentAmps - circuitI;

  return {
    fullScaleCurrentIgAmps: Number(fullScaleCurrentIgAmps.toFixed(6)),
    requiredShuntResistanceS: Number(requiredShuntResistanceS.toFixed(4)),
    installedShuntResistanceS: Number(installedS.toFixed(4)),
    totalAmmeterResistanceOhms: Number(totalAmmeterResistanceOhms.toFixed(4)),
    isCorrectShunt,
    appliedCircuitCurrentAmps: Number(circuitI.toFixed(3)),
    galvanometerDeflectionDivisions,
    measuredCurrentAmps: Number(measuredCurrentAmps.toFixed(3)),
    currentErrorAmps: Number(currentErrorAmps.toFixed(4)),
    isOverloaded,
  };
}
