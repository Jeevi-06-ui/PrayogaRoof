/**
 * Precision Mechanics Physical Models & Calculation Utilities
 * 
 * Provides rigorous mathematical and physical simulation functions for:
 * 1. Vernier Callipers (scales, coincidence, zero error, corrected dimensions, volumes)
 * 2. Micrometer Screw Gauge (pitch, circular scale, backlash/zero error, thickness, wire area)
 * 3. Area of an Irregular Lamina (grid integration, square counting, boundary uncertainty, Shoelace benchmark)
 * 4. Spherometer (equilateral tripod geometry, sagitta measurement, radius of curvature, validity checks)
 * 5. Physical Beam Balance (mass moments, damped pointer oscillation, resting point, equilibrium sensitivity)
 */

// =========================================================================
// 1. VERNIER CALLIPERS MODEL
// =========================================================================

export interface VernierCalliperConfig {
  mainScalePitchMm: number;    // Standard: 1.0 mm
  vernierDivisions: number;     // Standard: 10 divisions (spanning 9 mm) or 20
  zeroErrorMm: number;          // Zero error in mm (+ve or -ve)
}

export interface VernierReading {
  jawPositionMm: number;        // True physical separation of jaws in mm
  leastCountMm: number;         // LC = mainScalePitch / vernierDivisions
  msrMm: number;                // Main Scale Reading (integer multiple of pitch)
  vcd: number;                  // Vernier Coincident Division (0 to vernierDivisions - 1)
  observedReadingMm: number;    // MSR + (VCD * LC)
  zeroErrorMm: number;          // Systematic zero offset
  zeroCorrectionMm: number;     // -zeroErrorMm
  correctedReadingMm: number;   // observedReadingMm - zeroErrorMm
  correctedReadingCm: number;   // In centimeters
}

export function calculateVernierReading(
  jawPositionMm: number,
  config: Partial<VernierCalliperConfig> = {}
): VernierReading {
  const pitch = config.mainScalePitchMm ?? 1.0;
  const divisions = config.vernierDivisions ?? 10;
  const zeroError = config.zeroErrorMm ?? 0.0;
  const leastCount = pitch / divisions; // e.g., 1.0 / 10 = 0.1 mm

  // Clamp jaw position to non-negative
  const rawPos = Math.max(0, jawPositionMm);
  // Apparent position displayed on instrument scale includes zero error
  const scalePos = rawPos + zeroError;

  const msr = Math.floor(scalePos / pitch) * pitch;
  const fractional = scalePos - msr;
  const vcd = Math.round(fractional / leastCount) % divisions;
  const observed = msr + vcd * leastCount;
  const corrected = Math.max(0, observed - zeroError);

  return {
    jawPositionMm: rawPos,
    leastCountMm: leastCount,
    msrMm: Number(msr.toFixed(2)),
    vcd,
    observedReadingMm: Number(observed.toFixed(2)),
    zeroErrorMm: zeroError,
    zeroCorrectionMm: Number((-zeroError).toFixed(2)),
    correctedReadingMm: Number(corrected.toFixed(2)),
    correctedReadingCm: Number((corrected / 10).toFixed(3)),
  };
}

export function calculateCylinderVolume(diameterMm: number, lengthMm: number): {
  volumeMm3: number;
  volumeCm3: number;
} {
  const r = diameterMm / 2;
  const volumeMm3 = Math.PI * r * r * lengthMm;
  return {
    volumeMm3: Number(volumeMm3.toFixed(2)),
    volumeCm3: Number((volumeMm3 / 1000).toFixed(4)),
  };
}

export function calculateSphereVolume(diameterMm: number): {
  volumeMm3: number;
  volumeCm3: number;
} {
  const r = diameterMm / 2;
  const volumeMm3 = (4 / 3) * Math.PI * Math.pow(r, 3);
  return {
    volumeMm3: Number(volumeMm3.toFixed(2)),
    volumeCm3: Number((volumeMm3 / 1000).toFixed(4)),
  };
}

// =========================================================================
// 2. MICROMETER SCREW GAUGE MODEL
// =========================================================================

export interface ScrewGaugeConfig {
  pitchMm: number;              // Standard: 1.0 mm (or 0.5 mm)
  circularDivisions: number;    // Standard: 100 (or 50)
  zeroErrorDivisions: number;   // Zero error in circular divisions (+ve or -ve)
}

export interface ScrewGaugeReading {
  spindleGapMm: number;         // True separation of anvil & spindle in mm
  leastCountMm: number;         // LC = pitch / circularDivisions (e.g. 0.01 mm)
  psrMm: number;                // Pitch Scale Reading (in mm)
  csr: number;                  // Circular Scale Reading (division index 0 to N-1)
  observedReadingMm: number;    // PSR + (CSR * LC)
  zeroErrorMm: number;          // zeroErrorDivisions * LC
  zeroCorrectionMm: number;     // -zeroErrorMm
  correctedReadingMm: number;   // observedReadingMm - zeroErrorMm
  correctedReadingCm: number;   // In centimeters
}

export function calculateScrewGaugeReading(
  spindleGapMm: number,
  config: Partial<ScrewGaugeConfig> = {}
): ScrewGaugeReading {
  const pitch = config.pitchMm ?? 1.0;
  const circularDivs = config.circularDivisions ?? 100;
  const zeroErrorDivs = config.zeroErrorDivisions ?? 0;
  const leastCount = pitch / circularDivs; // e.g., 1.0 / 100 = 0.01 mm
  const zeroErrorMm = zeroErrorDivs * leastCount;

  const rawGap = Math.max(0, spindleGapMm);
  // Apparent gap displayed on sleeve + thimble includes zero error offset
  const scalePos = rawGap + zeroErrorMm;

  const psr = Math.floor(scalePos / pitch) * pitch;
  const remainder = scalePos - psr;
  const csr = Math.round(remainder / leastCount) % circularDivs;
  const observed = psr + csr * leastCount;
  const corrected = Math.max(0, observed - zeroErrorMm);

  return {
    spindleGapMm: rawGap,
    leastCountMm: leastCount,
    psrMm: Number(psr.toFixed(3)),
    csr,
    observedReadingMm: Number(observed.toFixed(3)),
    zeroErrorMm: Number(zeroErrorMm.toFixed(3)),
    zeroCorrectionMm: Number((-zeroErrorMm).toFixed(3)),
    correctedReadingMm: Number(corrected.toFixed(3)),
    correctedReadingCm: Number((corrected / 10).toFixed(4)),
  };
}

export function calculateWireCrossSection(diameterMm: number): {
  areaMm2: number;
  areaCm2: number;
} {
  const r = diameterMm / 2;
  const areaMm2 = Math.PI * r * r;
  return {
    areaMm2: Number(areaMm2.toFixed(4)),
    areaCm2: Number((areaMm2 / 100).toFixed(6)),
  };
}

// =========================================================================
// 3. AREA OF AN IRREGULAR LAMINA MODEL
// =========================================================================

export interface Point2D {
  x: number;
  y: number;
}

export interface LaminaAreaResult {
  fullSquaresCount: number;         // Completely inside (>75% covered)
  moreThanHalfCount: number;        // (50% to 75% covered)
  halfSquaresCount: number;         // (~40% to 50% covered)
  neglectedCount: number;           // (<40% covered)
  totalSquaresCount: number;        // N_full + N_moreThanHalf + 0.5 * N_half
  gridUnitCm: number;               // Width/height of one grid square in cm (e.g. 1 cm)
  unitSquareAreaCm2: number;        // gridUnitCm * gridUnitCm
  calculatedAreaCm2: number;        // Area in cm² from square counting
  uncertaintyCm2: number;           // Estimated boundary uncertainty in cm²
  theoreticalShoelaceAreaCm2: number; // Exact geometric polygon area for comparison
  percentageError: number;          // Relative error vs exact Shoelace area
}

/**
 * Standard irregular lamina outline shape (realistic leaf / specimen contour)
 * in local centimeter coordinates centered around origin.
 */
export const STANDARD_LAMINA_VERTICES: Point2D[] = [
  { x: 0, y: -4.5 },
  { x: 1.2, y: -3.6 },
  { x: 2.3, y: -2.1 },
  { x: 2.8, y: -0.5 },
  { x: 2.5, y: 1.2 },
  { x: 1.8, y: 2.8 },
  { x: 0.8, y: 4.0 },
  { x: 0, y: 4.8 },
  { x: -0.7, y: 3.8 },
  { x: -1.6, y: 2.5 },
  { x: -2.2, y: 0.8 },
  { x: -2.4, y: -0.9 },
  { x: -1.9, y: -2.4 },
  { x: -1.0, y: -3.8 },
];

/**
 * Calculates exact area of a closed polygon using the Shoelace formula (Gauss's area formula).
 */
export function calculateShoelaceArea(polygon: Point2D[]): number {
  const n = polygon.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    sum += polygon[i].x * polygon[next].y - polygon[next].x * polygon[i].y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Ray-casting algorithm to test whether a point is strictly inside a 2D polygon.
 */
export function isPointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Evaluates the area of an irregular lamina over a grid of squares
 * using standard educational square-counting rules.
 */
export function evaluateLaminaArea(
  polygon: Point2D[],
  gridUnitCm: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0
): LaminaAreaResult {
  // Translate polygon according to position offset
  const shifted: Point2D[] = polygon.map((pt) => ({
    x: pt.x + offsetX,
    y: pt.y + offsetY,
  }));

  // Determine bounding box in grid units
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  shifted.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  const startCol = Math.floor(minX / gridUnitCm) - 1;
  const endCol = Math.ceil(maxX / gridUnitCm) + 1;
  const startRow = Math.floor(minY / gridUnitCm) - 1;
  const endRow = Math.ceil(maxY / gridUnitCm) + 1;

  let fullSquares = 0;
  let moreThanHalf = 0;
  let halfSquares = 0;
  let neglected = 0;

  // Sample each grid square with a 4x4 subgrid (16 points) to estimate fraction
  const subDiv = 4;
  const totalSamples = subDiv * subDiv;

  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++) {
      const cellLeft = col * gridUnitCm;
      const cellTop = row * gridUnitCm;

      let insideCount = 0;
      for (let sx = 0; sx < subDiv; sx++) {
        for (let sy = 0; sy < subDiv; sy++) {
          const px = cellLeft + ((sx + 0.5) / subDiv) * gridUnitCm;
          const py = cellTop + ((sy + 0.5) / subDiv) * gridUnitCm;
          if (isPointInPolygon({ x: px, y: py }, shifted)) {
            insideCount++;
          }
        }
      }

      const fraction = insideCount / totalSamples;
      if (fraction >= 0.75) {
        fullSquares++;
      } else if (fraction >= 0.5) {
        moreThanHalf++;
      } else if (fraction >= 0.35) {
        halfSquares++;
      } else if (fraction > 0) {
        neglected++;
      }
    }
  }

  const effectiveSquares = fullSquares + moreThanHalf + 0.5 * halfSquares;
  const unitArea = gridUnitCm * gridUnitCm;
  const calculatedArea = effectiveSquares * unitArea;
  const uncertainty = 0.5 * (moreThanHalf + halfSquares) * unitArea;
  const theoreticalArea = calculateShoelaceArea(polygon);
  const errorPercent =
    theoreticalArea > 0
      ? Math.abs(calculatedArea - theoreticalArea) / theoreticalArea * 100
      : 0;

  return {
    fullSquaresCount: fullSquares,
    moreThanHalfCount: moreThanHalf,
    halfSquaresCount: halfSquares,
    neglectedCount: neglected,
    totalSquaresCount: effectiveSquares,
    gridUnitCm,
    unitSquareAreaCm2: unitArea,
    calculatedAreaCm2: Number(calculatedArea.toFixed(2)),
    uncertaintyCm2: Number(uncertainty.toFixed(2)),
    theoreticalShoelaceAreaCm2: Number(theoreticalArea.toFixed(2)),
    percentageError: Number(errorPercent.toFixed(1)),
  };
}

// =========================================================================
// 4. SPHEROMETER MODEL
// =========================================================================

export interface SpherometerConfig {
  legDistanceMm: number;        // Distance l between any two outer tripod legs (e.g. 40.0 mm)
  pitchMm: number;              // Pitch of central screw (1.0 mm)
  circularDivisions: number;    // Divisions on circular disk (100)
}

export interface SpherometerReading {
  legDistanceMm: number;        // l
  leastCountMm: number;         // LC = pitch / divisions (0.01 mm)
  flatReadingMm: number;        // h0: Reading on flat plane glass slab
  curvedReadingMm: number;      // h1: Reading on spherical surface
  sagittaMm: number;            // h = |h1 - h0|
  surfaceType: 'convex' | 'concave' | 'plane';
  isValidGeometry: boolean;     // Whether h and l satisfy valid spherical constraints
  validationMessage?: string;
  radiusOfCurvatureMm: number;  // R = l^2 / (6h) + h / 2
  radiusOfCurvatureCm: number;  // In cm
  uncertaintyMm: number;        // Estimated experimental uncertainty dR
}

export function calculateSpherometerRadius(
  curvedReadingMm: number,
  flatReadingMm: number = 0.0,
  config: Partial<SpherometerConfig> = {}
): SpherometerReading {
  const l = config.legDistanceMm ?? 40.0;
  const pitch = config.pitchMm ?? 1.0;
  const divisions = config.circularDivisions ?? 100;
  const leastCount = pitch / divisions; // 0.01 mm

  const deltaH = curvedReadingMm - flatReadingMm;
  const sagitta = Math.abs(deltaH);

  let surfaceType: 'convex' | 'concave' | 'plane' = 'plane';
  if (deltaH > 0.005) surfaceType = 'convex';
  else if (deltaH < -0.005) surfaceType = 'concave';

  // Geometry validity checks:
  // For 3 outer legs in an equilateral triangle, radius of outer circle is r0 = l / sqrt(3).
  // The sphere must have R >= r0, meaning h >= 0.01 mm.
  if (sagitta < 0.01) {
    return {
      legDistanceMm: l,
      leastCountMm: leastCount,
      flatReadingMm,
      curvedReadingMm,
      sagittaMm: 0,
      surfaceType: 'plane',
      isValidGeometry: true,
      validationMessage: 'Plane surface detected (sagitta h ≈ 0). Radius of curvature R is infinite (flat).',
      radiusOfCurvatureMm: Infinity,
      radiusOfCurvatureCm: Infinity,
      uncertaintyMm: 0,
    };
  }

  // Radius of curvature formula: R = (l^2) / (6 * h) + h / 2
  const rMm = (l * l) / (6 * sagitta) + sagitta / 2;
  const r0 = l / Math.sqrt(3);

  const isValid = rMm >= r0 && sagitta < l;
  const message = isValid
    ? undefined
    : `Physically invalid geometry: sagitta h (${sagitta.toFixed(2)} mm) exceeds geometric limits for leg separation l = ${l} mm.`;

  // Uncertainty estimation: dR/R = sqrt((2*dl/l)^2 + (dh/h)^2)
  const dl = 0.5; // mm (ruler uncertainty for leg distance)
  const dh = leastCount; // spherometer least count
  const fractionalUncertainty = Math.sqrt(Math.pow((2 * dl) / l, 2) + Math.pow(dh / sagitta, 2));
  const uncertaintyMm = isValid ? rMm * fractionalUncertainty : 0;

  return {
    legDistanceMm: l,
    leastCountMm: leastCount,
    flatReadingMm,
    curvedReadingMm,
    sagittaMm: Number(sagitta.toFixed(3)),
    surfaceType,
    isValidGeometry: isValid,
    validationMessage: message,
    radiusOfCurvatureMm: isValid ? Number(rMm.toFixed(2)) : 0,
    radiusOfCurvatureCm: isValid ? Number((rMm / 10).toFixed(2)) : 0,
    uncertaintyMm: isValid ? Number(uncertaintyMm.toFixed(2)) : 0,
  };
}

// =========================================================================
// 5. PHYSICAL BEAM BALANCE MODEL
// =========================================================================

export interface BeamBalanceState {
  isArrested: boolean;              // True if beam is arrested on support, false if released
  leftPanMassGrams: number;         // Specimen + any weights on left pan
  rightPanMassGrams: number;        // Weights placed on right pan
  massDifferenceGrams: number;      // rightPanMass - leftPanMass
  pointerRestingDivision: number;   // Equilibrium division (-5 to +5, 0 = balanced)
  isBalanced: boolean;              // True if |deltaM| <= balanceThreshold
  balanceThresholdGrams: number;    // Sensitivity threshold (typically 0.005 g = 5 mg)
  status: 'balanced' | 'tilted-left' | 'tilted-right' | 'arrested';
  currentPointerAngleDeg: number;   // Live visual angle of pointer needle
}

export function calculateBeamBalanceState(
  leftPanMassG: number,
  rightPanMassG: number,
  isArrested: boolean = false,
  timeSeconds: number = 0,
  sensitivityGPerDivision: number = 0.01 // 10 mg per index scale division
): BeamBalanceState {
  if (isArrested) {
    return {
      isArrested: true,
      leftPanMassGrams: leftPanMassG,
      rightPanMassGrams: rightPanMassG,
      massDifferenceGrams: Number((rightPanMassG - leftPanMassG).toFixed(4)),
      pointerRestingDivision: 0,
      isBalanced: false,
      balanceThresholdGrams: 0.005,
      status: 'arrested',
      currentPointerAngleDeg: 0,
    };
  }

  const deltaM = rightPanMassG - leftPanMassG;
  const threshold = 0.005; // 5 mg threshold
  const isBalanced = Math.abs(deltaM) <= threshold;

  // Max scale is +/- 5 divisions from center 0
  const restingDivision = Math.max(-5, Math.min(5, deltaM / sensitivityGPerDivision));

  let status: 'balanced' | 'tilted-left' | 'tilted-right' = 'balanced';
  if (deltaM < -threshold) status = 'tilted-left';
  else if (deltaM > threshold) status = 'tilted-right';

  // Dynamic damped oscillation around resting position
  // theta(t) = restingDiv + A0 * e^(-gamma * t) * cos(omega * t)
  const dampingGamma = 0.35;
  const omega = 2.5; // oscillation frequency in rad/s
  const initialAmplitude = Math.min(4, Math.abs(deltaM) * 3 + 1.5);
  const dampedOscillation =
    initialAmplitude * Math.exp(-dampingGamma * timeSeconds) * Math.cos(omega * timeSeconds);
  const liveDivision = Math.max(-5, Math.min(5, restingDivision + dampedOscillation));

  // 1 division corresponds to ~3.5 degrees of pointer tilt
  const pointerAngleDeg = Number((liveDivision * 3.5).toFixed(2));

  return {
    isArrested: false,
    leftPanMassGrams: Number(leftPanMassG.toFixed(4)),
    rightPanMassGrams: Number(rightPanMassG.toFixed(4)),
    massDifferenceGrams: Number(deltaM.toFixed(4)),
    pointerRestingDivision: Number(restingDivision.toFixed(2)),
    isBalanced,
    balanceThresholdGrams: threshold,
    status,
    currentPointerAngleDeg: pointerAngleDeg,
  };
}

/**
 * Calculates resting point (RP) from three consecutive turning points using the method of oscillations:
 * RP = (d1 + 2*d2 + d3) / 4
 */
export function calculateRestingPoint(d1: number, d2: number, d3: number): number {
  return Number(((d1 + 2 * d2 + d3) / 4).toFixed(2));
}
