/**
 * PrayogaProof - Vector Mechanics & Classical Physics Model
 *
 * Headless, deterministic physical models for Class 11 Physics Experiments:
 * 1. Parallelogram Law of Vectors (Coplanar concurrent forces, resultant, equilibrant)
 * 2. Laws of Limiting Friction (Static friction, limiting threshold, kinetic friction, surface pairs)
 * 3. Friction on an Inclined Plane (Gravitational decomposition, normal force, angle of repose)
 * 4. Hooke's Law and Spring Constant (Linear elasticity, spring constant, dynamic oscillation, elastic limit)
 * 5. Boyle's Law (Ideal gas isothermal compression/expansion, P-V product, manometer differential)
 */

export const GRAVITY_STANDARD = 9.80665; // m/s^2

// ============================================================================
// 1. Parallelogram Law of Vectors
// ============================================================================

export interface VectorAdditionParams {
  forceP: number; // Force P in Newtons (or grams-weight)
  anglePDeg: number; // Angle of Force P relative to horizontal (degrees)
  forceQ: number; // Force Q in Newtons (or grams-weight)
  angleQDeg: number; // Angle of Force Q relative to horizontal (degrees)
  balancingMassGrams?: number; // Optional experimental balancing mass in grams
}

export interface VectorAdditionResult {
  forceP: number;
  anglePDeg: number;
  forceQ: number;
  angleQDeg: number;
  includedAngleDeg: number; // theta between P and Q
  resultantMagnitude: number; // R = sqrt(P^2 + Q^2 + 2PQ cos theta)
  resultantAngleDeg: number; // Absolute angle of R
  angleAlphaDeg: number; // Angle of R relative to P: tan alpha = (Q sin theta) / (P + Q cos theta)
  resultantComponentX: number; // Rx = Px + Qx
  resultantComponentY: number; // Ry = Py + Qy
  equilibrantMagnitude: number; // Equal to R
  equilibrantAngleDeg: number; // (resultantAngle + 180) % 360
  experimentalBalancingForceN: number;
  percentageError: number; // Discrepancy between theoretical R and experimental balancing force
  isEquilibriumValid: boolean;
}

/**
 * Calculates vector addition using Parallelogram Law of Vectors.
 * Formulations:
 * R = sqrt(P^2 + Q^2 + 2 * P * Q * cos(theta))
 * alpha = atan2(Q * sin(theta), P + Q * cos(theta))
 */
export function calculateVectorAddition(params: VectorAdditionParams): VectorAdditionResult {
  const p = Math.max(0, params.forceP);
  const q = Math.max(0, params.forceQ);
  const angleP = params.anglePDeg;
  const angleQ = params.angleQDeg;

  // Convert to radians for Cartesian projection
  const radP = (angleP * Math.PI) / 180;
  const radQ = (angleQ * Math.PI) / 180;

  // Components along X and Y axes
  const px = p * Math.cos(radP);
  const py = p * Math.sin(radP);
  const qx = q * Math.cos(radQ);
  const qy = q * Math.sin(radQ);

  const rx = px + qx;
  const ry = py + qy;

  const resultantMagnitude = Math.sqrt(rx * rx + ry * ry);
  let resultantAngleDeg = (Math.atan2(ry, rx) * 180) / Math.PI;
  if (resultantAngleDeg < 0) resultantAngleDeg += 360;

  // Included angle theta between P and Q (0 to 180 deg)
  let includedAngleDeg = Math.abs(angleQ - angleP) % 360;
  if (includedAngleDeg > 180) includedAngleDeg = 360 - includedAngleDeg;
  const radTheta = (includedAngleDeg * Math.PI) / 180;

  // Theoretical R from analytical parallelogram formula
  const theoreticalR = Math.sqrt(
    Math.max(0, p * p + q * q + 2 * p * q * Math.cos(radTheta))
  );

  // Angle alpha relative to vector P
  let angleAlphaDeg = 0;
  const denom = p + q * Math.cos(radTheta);
  const num = q * Math.sin(radTheta);
  if (Math.abs(denom) > 1e-7 || Math.abs(num) > 1e-7) {
    angleAlphaDeg = (Math.atan2(num, denom) * 180) / Math.PI;
  }

  // Equilibrant force (balances R)
  const equilibrantMagnitude = resultantMagnitude;
  const equilibrantAngleDeg = (resultantAngleDeg + 180) % 360;

  // Experimental balancing force (if provided in grams, convert to N using g = 9.8)
  const balGrams = params.balancingMassGrams ?? (resultantMagnitude * 1000) / GRAVITY_STANDARD;
  const experimentalBalancingForceN = (balGrams * GRAVITY_STANDARD) / 1000;

  let percentageError = 0;
  if (theoreticalR > 0.001) {
    percentageError = (Math.abs(theoreticalR - experimentalBalancingForceN) / theoreticalR) * 100;
  }

  return {
    forceP: Number(p.toFixed(3)),
    anglePDeg: Number(angleP.toFixed(1)),
    forceQ: Number(q.toFixed(3)),
    angleQDeg: Number(angleQ.toFixed(1)),
    includedAngleDeg: Number(includedAngleDeg.toFixed(2)),
    resultantMagnitude: Number(resultantMagnitude.toFixed(3)),
    resultantAngleDeg: Number(resultantAngleDeg.toFixed(1)),
    angleAlphaDeg: Number(angleAlphaDeg.toFixed(2)),
    resultantComponentX: Number(rx.toFixed(3)),
    resultantComponentY: Number(ry.toFixed(3)),
    equilibrantMagnitude: Number(equilibrantMagnitude.toFixed(3)),
    equilibrantAngleDeg: Number(equilibrantAngleDeg.toFixed(1)),
    experimentalBalancingForceN: Number(experimentalBalancingForceN.toFixed(3)),
    percentageError: Number(percentageError.toFixed(2)),
    isEquilibriumValid: percentageError < 5.0,
  };
}

// ============================================================================
// 2. Laws of Limiting Friction
// ============================================================================

export type SurfacePair = 'wood-on-wood' | 'wood-on-glass' | 'wood-on-sandpaper' | 'metal-on-metal';

export interface SurfaceProperties {
  label: string;
  staticCoeff: number; // mu_s
  kineticCoeff: number; // mu_k
}

export const SURFACE_FRICTION_PRESETS: Record<SurfacePair, SurfaceProperties> = {
  'wood-on-wood': { label: 'Wood on Polished Wood', staticCoeff: 0.35, kineticCoeff: 0.28 },
  'wood-on-glass': { label: 'Wood on Glass Plate', staticCoeff: 0.22, kineticCoeff: 0.18 },
  'wood-on-sandpaper': { label: 'Wood on Rough Sandpaper', staticCoeff: 0.65, kineticCoeff: 0.52 },
  'metal-on-metal': { label: 'Brass on Polished Steel', staticCoeff: 0.30, kineticCoeff: 0.24 },
};

export interface LimitingFrictionParams {
  blockMassGrams: number; // Mass of the slider block (e.g., 100g)
  addedMassGrams: number; // Extra slotted masses on top of the block (0–500g)
  panMassGrams: number; // Mass of the scale pan (e.g., 30g)
  addedPanMassGrams: number; // Weights placed in the pulling pan (0–500g)
  surfacePair: SurfacePair;
  contactOrientation?: 'broad-side' | 'narrow-edge'; // Demonstrates area independence
}

export interface LimitingFrictionResult {
  totalBlockMassKg: number;
  normalReactionN: number; // N = M_total * g
  staticCoeff: number; // mu_s
  kineticCoeff: number; // mu_k
  limitingFrictionN: number; // f_s,max = mu_s * N
  appliedPullingForceN: number; // F_pull = M_pan_total * g
  isMotionInitiated: boolean; // F_pull >= f_s,max
  frictionForceN: number; // f_s when stationary, f_k when moving
  netForceN: number; // F_net = F_pull - f_k (>= 0)
  accelerationMs2: number; // a = F_net / M_total_system
  contactAreaCm2: number; // Demonstration value
  isAreaIndependent: boolean;
}

/**
 * Evaluates static and kinetic friction regimes.
 * When applied pulling force < f_s,max: static friction balances applied force (f = F_pull, a = 0).
 * When applied pulling force >= f_s,max: motion begins, friction drops to f_k = mu_k * N.
 */
export function calculateLimitingFriction(params: LimitingFrictionParams): LimitingFrictionResult {
  const blockMassG = Math.max(10, params.blockMassGrams);
  const addedMassG = Math.max(0, params.addedMassGrams);
  const panMassG = Math.max(0, params.panMassGrams);
  const addedPanMassG = Math.max(0, params.addedPanMassGrams);

  const surface = SURFACE_FRICTION_PRESETS[params.surfacePair] || SURFACE_FRICTION_PRESETS['wood-on-wood'];
  const totalBlockMassKg = (blockMassG + addedMassG) / 1000;
  const totalPanMassKg = (panMassG + addedPanMassG) / 1000;

  const normalReactionN = totalBlockMassKg * GRAVITY_STANDARD;
  const limitingFrictionN = surface.staticCoeff * normalReactionN;
  const appliedPullingForceN = totalPanMassKg * GRAVITY_STANDARD;

  const isMotionInitiated = appliedPullingForceN >= limitingFrictionN - 1e-5;

  let frictionForceN: number;
  let netForceN = 0;
  let accelerationMs2 = 0;

  if (isMotionInitiated) {
    // Kinetic regime
    frictionForceN = surface.kineticCoeff * normalReactionN;
    netForceN = Math.max(0, appliedPullingForceN - frictionForceN);
    const totalSystemMassKg = totalBlockMassKg + totalPanMassKg;
    accelerationMs2 = totalSystemMassKg > 0 ? netForceN / totalSystemMassKg : 0;
  } else {
    // Static regime: friction balances applied force exactly
    frictionForceN = appliedPullingForceN;
    netForceN = 0;
    accelerationMs2 = 0;
  }

  const orientation = params.contactOrientation ?? 'broad-side';
  const contactAreaCm2 = orientation === 'broad-side' ? 60 : 20;

  return {
    totalBlockMassKg: Number(totalBlockMassKg.toFixed(4)),
    normalReactionN: Number(normalReactionN.toFixed(3)),
    staticCoeff: surface.staticCoeff,
    kineticCoeff: surface.kineticCoeff,
    limitingFrictionN: Number(limitingFrictionN.toFixed(3)),
    appliedPullingForceN: Number(appliedPullingForceN.toFixed(3)),
    isMotionInitiated,
    frictionForceN: Number(frictionForceN.toFixed(3)),
    netForceN: Number(netForceN.toFixed(3)),
    accelerationMs2: Number(accelerationMs2.toFixed(3)),
    contactAreaCm2,
    isAreaIndependent: true,
  };
}

// ============================================================================
// 3. Friction on an Inclined Plane
// ============================================================================

export interface InclinedPlaneParams {
  blockMassGrams: number; // Slider block mass (g)
  inclineAngleDeg: number; // Incline angle theta (0 to 75 degrees)
  surfacePair: SurfacePair;
  pullingEffortGrams?: number; // Optional effort mass in pan to pull block up the plane
}

export interface InclinedPlaneResult {
  inclineAngleDeg: number;
  inclineAngleRad: number;
  normalForceN: number; // N = m * g * cos(theta)
  parallelGravityN: number; // F_parallel = m * g * sin(theta)
  staticCoeff: number; // mu_s
  kineticCoeff: number; // mu_k
  limitingFrictionN: number; // f_s,max = mu_s * N
  angleReposeDeg: number; // theta_r = atan(mu_s) in degrees
  isSlidingDownSpontaneously: boolean; // theta >= theta_r
  downwardFrictionN: number;
  netDownwardForceN: number; // F_down = m*g*sin(theta) - f_k
  downwardAccelerationMs2: number;
  minimumEffortToPullUpN: number; // P_up = m*g*(sin(theta) + mu_s * cos(theta))
  appliedEffortN: number;
  isMovingUpwards: boolean;
}

/**
 * Calculates force resolution and motion on an inclined plane.
 * Gravitational force decomposes into:
 * Normal force: N = mg cos(theta)
 * Parallel force pulling down slope: F_parallel = mg sin(theta)
 * Angle of repose: theta_r = arctan(mu_s)
 */
export function calculateInclinedPlanePhysics(params: InclinedPlaneParams): InclinedPlaneResult {
  const blockMassG = Math.max(10, params.blockMassGrams);
  const angleDeg = Math.min(85, Math.max(0, params.inclineAngleDeg));
  const angleRad = (angleDeg * Math.PI) / 180;

  const surface = SURFACE_FRICTION_PRESETS[params.surfacePair] || SURFACE_FRICTION_PRESETS['wood-on-wood'];
  const blockMassKg = blockMassG / 1000;
  const mg = blockMassKg * GRAVITY_STANDARD;

  const normalForceN = mg * Math.cos(angleRad);
  const parallelGravityN = mg * Math.sin(angleRad);

  const limitingFrictionN = surface.staticCoeff * normalForceN;
  const angleReposeRad = Math.atan(surface.staticCoeff);
  const angleReposeDeg = (angleReposeRad * 180) / Math.PI;

  const isSlidingDownSpontaneously = angleDeg >= angleReposeDeg - 0.01;

  let downwardFrictionN: number;
  let netDownwardForceN = 0;
  let downwardAccelerationMs2 = 0;

  if (isSlidingDownSpontaneously) {
    downwardFrictionN = surface.kineticCoeff * normalForceN;
    netDownwardForceN = Math.max(0, parallelGravityN - downwardFrictionN);
    downwardAccelerationMs2 = netDownwardForceN / blockMassKg;
  } else {
    downwardFrictionN = parallelGravityN;
    netDownwardForceN = 0;
    downwardAccelerationMs2 = 0;
  }

  // Minimum effort required to initiate upward motion along incline
  // P_up = mg sin(theta) + mu_s * mg cos(theta)
  const minimumEffortToPullUpN = parallelGravityN + limitingFrictionN;

  const effortMassG = Math.max(0, params.pullingEffortGrams ?? 0);
  const appliedEffortN = (effortMassG * GRAVITY_STANDARD) / 1000;
  const isMovingUpwards = appliedEffortN >= minimumEffortToPullUpN;

  return {
    inclineAngleDeg: Number(angleDeg.toFixed(1)),
    inclineAngleRad: Number(angleRad.toFixed(4)),
    normalForceN: Number(normalForceN.toFixed(3)),
    parallelGravityN: Number(parallelGravityN.toFixed(3)),
    staticCoeff: surface.staticCoeff,
    kineticCoeff: surface.kineticCoeff,
    limitingFrictionN: Number(limitingFrictionN.toFixed(3)),
    angleReposeDeg: Number(angleReposeDeg.toFixed(2)),
    isSlidingDownSpontaneously,
    downwardFrictionN: Number(downwardFrictionN.toFixed(3)),
    netDownwardForceN: Number(netDownwardForceN.toFixed(3)),
    downwardAccelerationMs2: Number(downwardAccelerationMs2.toFixed(3)),
    minimumEffortToPullUpN: Number(minimumEffortToPullUpN.toFixed(3)),
    appliedEffortN: Number(appliedEffortN.toFixed(3)),
    isMovingUpwards,
  };
}

// ============================================================================
// 4. Hooke's Law and Spring Constant
// ============================================================================

export interface HookesLawParams {
  springConstantNpm: number; // Spring stiffness k in N/m (e.g., 25 N/m)
  appliedMassGrams: number; // Slotted mass suspended on hanger (0–500g)
  hangerMassGrams?: number; // Mass of the hanger itself (e.g., 50g)
  unstretchedLengthMm?: number; // Zero-load baseline spring length (e.g., 120 mm)
  elasticLimitNewtons?: number; // Max force before plastic deformation (e.g., 5.0 N)
}

export interface HookesLawResult {
  springConstantNpm: number;
  totalSuspendedMassGrams: number;
  appliedForceN: number; // F = m * g
  extensionMm: number; // x = F / k in mm
  totalLengthMm: number; // L = L0 + x
  restoringForceN: number; // -k * x
  elasticPotentialEnergyJoules: number; // U = 0.5 * k * x^2
  isWithinElasticLimit: boolean;
  isPlasticDeformation: boolean;
  dynamicPeriodSeconds: number; // T = 2*pi*sqrt((m + m_eff)/k)
  dynamicFrequencyHz: number; // f = 1/T
  effectiveSpringMassGrams: number;
}

/**
 * Calculates linear elastic elongation under Hooke's Law: F = k * x.
 * Also models dynamic oscillation period: T = 2 * pi * sqrt((m + m_eff)/k)
 * where m_eff approx 1/3 * m_spring.
 */
export function calculateHookesLaw(params: HookesLawParams): HookesLawResult {
  const k = Math.max(1.0, params.springConstantNpm);
  const appliedG = Math.max(0, params.appliedMassGrams);
  const hangerG = Math.max(0, params.hangerMassGrams ?? 50);
  const totalMassG = appliedG + hangerG;
  const totalMassKg = totalMassG / 1000;

  const unstretchedMm = params.unstretchedLengthMm ?? 120;
  const elasticLimitN = params.elasticLimitNewtons ?? 6.0;

  const appliedForceN = totalMassKg * GRAVITY_STANDARD;
  const isWithinElasticLimit = appliedForceN <= elasticLimitN;
  const isPlasticDeformation = appliedForceN > elasticLimitN * 1.25;

  // Linear extension x = F / k (in meters -> mm)
  let extensionM: number;
  if (isWithinElasticLimit) {
    extensionM = appliedForceN / k;
  } else {
    // Non-linear post-yield stretch
    const elasticM = elasticLimitN / k;
    const plasticOver = (appliedForceN - elasticLimitN) / (k * 0.4);
    extensionM = elasticM + plasticOver;
  }

  const extensionMm = extensionM * 1000;
  const totalLengthMm = unstretchedMm + extensionMm;
  const restoringForceN = -k * extensionM;
  const elasticPotentialEnergyJoules = 0.5 * k * extensionM * extensionM;

  // Dynamic oscillation period (with effective spring inertia m_eff = 15g)
  const effectiveSpringMassGrams = 15;
  const effectiveTotalMassKg = totalMassKg + effectiveSpringMassGrams / 1000;
  const dynamicPeriodSeconds = 2 * Math.PI * Math.sqrt(effectiveTotalMassKg / k);
  const dynamicFrequencyHz = dynamicPeriodSeconds > 0 ? 1 / dynamicPeriodSeconds : 0;

  return {
    springConstantNpm: Number(k.toFixed(2)),
    totalSuspendedMassGrams: totalMassG,
    appliedForceN: Number(appliedForceN.toFixed(3)),
    extensionMm: Number(extensionMm.toFixed(2)),
    totalLengthMm: Number(totalLengthMm.toFixed(2)),
    restoringForceN: Number(restoringForceN.toFixed(3)),
    elasticPotentialEnergyJoules: Number(elasticPotentialEnergyJoules.toFixed(4)),
    isWithinElasticLimit,
    isPlasticDeformation,
    dynamicPeriodSeconds: Number(dynamicPeriodSeconds.toFixed(3)),
    dynamicFrequencyHz: Number(dynamicFrequencyHz.toFixed(2)),
    effectiveSpringMassGrams,
  };
}

// ============================================================================
// 5. Boyle's Law
// ============================================================================

export interface BoylesLawParams {
  volumeMl: number; // Enclosed gas volume in milliliters (e.g., 20–100 mL)
  atmosphericPressureKpa?: number; // Standard ambient pressure (default 101.325 kPa = 760 mmHg)
  temperatureKelvin?: number; // Isothermal temperature (default 298.15 K = 25 C)
  referenceVolumeMl?: number; // Baseline volume at atmospheric pressure (default 60 mL)
}

export interface BoylesLawResult {
  volumeMl: number;
  volumeLiters: number;
  reciprocalVolumePerMl: number; // 1 / V (mL^-1)
  reciprocalVolumePerLiter: number; // 1 / V (L^-1)
  pressureKpa: number; // Total absolute gas pressure P (kPa)
  pressureAtm: number; // Pressure in atmospheres (atm)
  pressureMmHg: number; // Pressure in mmHg / torr
  manometerDeltaHeightMmHg: number; // h = P_gas - P_atm in mmHg
  pvProductKpaMl: number; // P * V product (kPa * mL)
  pvProductJoules: number; // P * V in Joules (N*m)
  temperatureKelvin: number;
  isVolumeValid: boolean;
  isValidRange: boolean;
}

/**
 * Models Boyle's Law for ideal gas at constant temperature:
 * P * V = Constant (P1 * V1 = P2 * V2 = n * R * T)
 * P = C / V
 */
export function calculateBoylesLaw(params: BoylesLawParams): BoylesLawResult {
  const pAtmKpa = params.atmosphericPressureKpa ?? 101.325;
  const tempK = params.temperatureKelvin ?? 298.15;
  const refVolMl = params.referenceVolumeMl ?? 60.0;

  // Constant C = P_atm * V_ref
  const constantKpaMl = pAtmKpa * refVolMl;

  // Clamped volume to prevent physical singularity at V = 0
  const safeVolumeMl = Math.max(10.0, Math.min(150.0, params.volumeMl));
  const isVolumeValid = params.volumeMl >= 10.0 && params.volumeMl <= 150.0;

  const volumeLiters = safeVolumeMl / 1000;
  const reciprocalVolumePerMl = 1 / safeVolumeMl;
  const reciprocalVolumePerLiter = 1 / volumeLiters;

  // Absolute pressure from isothermal Boyle's law
  const pressureKpa = constantKpaMl / safeVolumeMl;
  const pressureAtm = pressureKpa / 101.325;
  const pressureMmHg = pressureAtm * 760.0;

  // Height difference in mercury manometer: h = P_gas - P_atm in mmHg
  const manometerDeltaHeightMmHg = pressureMmHg - 760.0;

  const pvProductKpaMl = pressureKpa * safeVolumeMl;
  // PV in Joules: (P in Pa) * (V in m^3) = (kPa * 1000) * (mL * 1e-6) = kPa * mL * 1e-3
  const pvProductJoules = pvProductKpaMl * 1e-3;

  return {
    volumeMl: Number(safeVolumeMl.toFixed(1)),
    volumeLiters: Number(volumeLiters.toFixed(4)),
    reciprocalVolumePerMl: Number(reciprocalVolumePerMl.toFixed(5)),
    reciprocalVolumePerLiter: Number(reciprocalVolumePerLiter.toFixed(2)),
    pressureKpa: Number(pressureKpa.toFixed(2)),
    pressureAtm: Number(pressureAtm.toFixed(3)),
    pressureMmHg: Number(pressureMmHg.toFixed(1)),
    manometerDeltaHeightMmHg: Number(manometerDeltaHeightMmHg.toFixed(1)),
    pvProductKpaMl: Number(pvProductKpaMl.toFixed(1)),
    pvProductJoules: Number(pvProductJoules.toFixed(2)),
    temperatureKelvin: Number(tempK.toFixed(1)),
    isVolumeValid,
    isValidRange: pressureKpa >= 30.0 && pressureKpa <= 600.0,
  };
}
