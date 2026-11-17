/**
 * Advanced Optics and Semiconductor Physics Models (Class 12)
 *
 * Covers:
 * 1. Concave Mirror (Ray Optics, Mirror Formula, Real & Virtual Images)
 * 2. Convex Mirror (Virtual Image Formation, Auxiliary Lens Method)
 * 3. Concave Lens (Diverging Lens Ray Tracing, Combination Method)
 * 4. Prism Refraction (Snell's Law at both faces, Minimum Deviation Dm, Refractive Index μ)
 * 5. P-N Junction Diode (Forward/Reverse Bias I-V Characteristics, Knee Voltage, Dynamic Resistance)
 */

export type OpticalMirrorType = 'concave' | 'convex';

export interface OpticalRayPath {
  id: string;
  name: string;
  points: number[]; // [x1, y1, x2, y2, ...]
  virtualPoints?: number[]; // dashed back-traced points for virtual image
  color: string;
}

export interface SphericalMirrorResult {
  focalLengthCm: number; // Signed focal length: negative for concave, positive for convex
  magnitudeFocalLengthCm: number; // |f|
  radiusOfCurvatureCm: number; // R = 2 * |f|
  objectDistanceCm: number; // Magnitude d_obj (real object distance)
  objectHeightCm: number; // h_o
  imageDistanceCm: number; // Signed v: negative for real in front, positive for virtual behind
  imageHeightCm: number; // Signed h_i: negative for inverted, positive for erect
  linearMagnification: number; // m = -v/u
  imageNature: 'Real, Inverted' | 'Virtual, Erect' | 'At Infinity (Parallel Rays)';
  imageCategory:
    | 'beyond-c'
    | 'at-c'
    | 'between-c-and-f'
    | 'at-f'
    | 'between-f-and-p'
    | 'convex-virtual';
  isReal: boolean;
  isVirtual: boolean;
  isAtInfinity: boolean;
  canCatchOnScreen: boolean;
  focalMarkers: {
    P: number;
    F: number;
    C: number;
  };
  rayPaths: OpticalRayPath[];
  formulaSummary: string;
  assumptions: string[];
}

/**
 * Calculates Concave Mirror Optics:
 * Mirror Formula (Cartesian Sign Convention):
 * 1/f = 1/v + 1/u  where f = -|f|, u = -d_obj
 * => 1/v = 1/f - 1/u = -1/|f| - 1/(-d_obj) = 1/d_obj - 1/|f| = (|f| - d_obj) / (d_obj * |f|)
 * => v = (d_obj * |f|) / (|f| - d_obj)
 * Real image in front of mirror: v < 0 (when d_obj > |f|)
 * Virtual image behind mirror: v > 0 (when d_obj < |f|)
 * Magnification: m = -v/u = -v / (-d_obj) = v / d_obj
 */
export function calculateConcaveMirror(params: {
  focalLengthCm: number;
  objectDistanceCm: number;
  objectHeightCm?: number;
  benchPositionCm?: number;
}): SphericalMirrorResult {
  const fMag = Math.max(2.0, Math.abs(params.focalLengthCm || 15.0));
  const uMag = Math.max(1.0, Math.abs(params.objectDistanceCm || 30.0));
  const hO = Math.max(1.0, params.objectHeightCm ?? 4.0);
  const benchX = params.benchPositionCm ?? 75.0;

  const diff = fMag - uMag;
  const isAtInfinity = Math.abs(diff) < 0.15;

  let v = 0;
  let m = 0;
  let hI = 0;
  let imageNature: 'Real, Inverted' | 'Virtual, Erect' | 'At Infinity (Parallel Rays)' =
    'Real, Inverted';
  let imageCategory:
    | 'beyond-c'
    | 'at-c'
    | 'between-c-and-f'
    | 'at-f'
    | 'between-f-and-p'
    | 'convex-virtual' = 'at-c';

  if (isAtInfinity) {
    v = -9999;
    m = -9999;
    hI = -9999;
    imageNature = 'At Infinity (Parallel Rays)';
    imageCategory = 'at-f';
  } else if (uMag > fMag) {
    // Real, inverted image in front of mirror (v < 0)
    v = -Number(((uMag * fMag) / (uMag - fMag)).toFixed(2));
    m = Number((v / uMag).toFixed(2)); // negative since v is negative
    hI = Number((m * hO).toFixed(2));
    imageNature = 'Real, Inverted';

    const twoF = 2 * fMag;
    if (Math.abs(uMag - twoF) < 0.25) {
      imageCategory = 'at-c';
    } else if (uMag > twoF) {
      imageCategory = 'beyond-c';
    } else {
      imageCategory = 'between-c-and-f';
    }
  } else {
    // Virtual, erect image behind mirror (v > 0)
    v = Number(((uMag * fMag) / diff).toFixed(2)); // positive
    m = Number((v / uMag).toFixed(2)); // positive (> 1)
    hI = Number((m * hO).toFixed(2));
    imageNature = 'Virtual, Erect';
    imageCategory = 'between-f-and-p';
  }

  // Visual coordinates scale (pixels)
  const pxScale = 3.5;
  const mirrorCanvasX = 320;
  const axisY = 110;

  const objCanvasX = mirrorCanvasX - uMag * pxScale;
  const objTopY = axisY - hO * pxScale;
  const fCanvasX = mirrorCanvasX - fMag * pxScale;
  const cCanvasX = mirrorCanvasX - 2 * fMag * pxScale;

  const rayPaths: OpticalRayPath[] = [];

  if (isAtInfinity) {
    // Ray 1: Parallel to axis, reflects through focus F
    rayPaths.push({
      id: 'ray-1',
      name: 'Parallel Ray (reflects through Focus F)',
      points: [objCanvasX, objTopY, mirrorCanvasX, objTopY, fCanvasX, axisY, fCanvasX - 160, axisY + 45],
      color: '#ef4444',
    });
    // Ray 2: Focal ray to mirror, reflects parallel
    rayPaths.push({
      id: 'ray-2',
      name: 'Central Ray to Pole (reflects symmetrically)',
      points: [objCanvasX, objTopY, mirrorCanvasX, axisY, objCanvasX - 50, axisY + (axisY - objTopY) * 1.3],
      color: '#3b82f6',
    });
  } else if (uMag > fMag) {
    // Real image position on incident side (left of mirror)
    const imgCanvasX = mirrorCanvasX - Math.abs(v) * pxScale;
    const imgTipY = axisY - hI * pxScale; // inverted: imgTipY > axisY

    // Ray 1: Parallel to axis, reflects through F to image tip
    rayPaths.push({
      id: 'ray-1',
      name: 'Parallel Ray (reflects through Focus F)',
      points: [objCanvasX, objTopY, mirrorCanvasX, objTopY, fCanvasX, axisY, imgCanvasX, imgTipY],
      color: '#ef4444',
    });

    // Ray 2: Ray through Pole P, reflects with equal angle
    rayPaths.push({
      id: 'ray-2',
      name: 'Pole Ray (i = r reflection at P)',
      points: [objCanvasX, objTopY, mirrorCanvasX, axisY, imgCanvasX, imgTipY],
      color: '#3b82f6',
    });

    // Ray 3: Ray through Center of Curvature C
    if (Math.abs(uMag - 2 * fMag) > 1.5) {
      rayPaths.push({
        id: 'ray-3',
        name: 'Center Ray (passes through C, reflects back)',
        points: [objCanvasX, objTopY, cCanvasX, axisY, mirrorCanvasX, axisY + (axisY - objTopY) * 0.4],
        color: '#10b981',
      });
    }
  } else {
    // Virtual image behind mirror (right of mirror)
    const imgCanvasX = mirrorCanvasX + v * pxScale;
    const imgTipY = axisY - hI * pxScale; // erect: imgTipY < axisY

    // Ray 1: Parallel to axis, reflects through F in front, dashed back into mirror
    rayPaths.push({
      id: 'ray-1',
      name: 'Parallel Ray (reflects through F, back-traced)',
      points: [objCanvasX, objTopY, mirrorCanvasX, objTopY, fCanvasX, axisY, fCanvasX - 60, axisY + 40],
      virtualPoints: [mirrorCanvasX, objTopY, imgCanvasX, imgTipY],
      color: '#ef4444',
    });

    // Ray 2: Ray to pole P, reflects downward, dashed back to virtual image tip
    const reflSlope = (axisY - objTopY) / (mirrorCanvasX - objCanvasX);
    const forwardX = mirrorCanvasX - 100;
    const forwardY = axisY + reflSlope * 100;

    rayPaths.push({
      id: 'ray-2',
      name: 'Pole Ray (reflects symmetrically, back-traced)',
      points: [objCanvasX, objTopY, mirrorCanvasX, axisY, forwardX, forwardY],
      virtualPoints: [mirrorCanvasX, axisY, imgCanvasX, imgTipY],
      color: '#3b82f6',
    });
  }

  const formulaSummary = isAtInfinity
    ? `Object at Focus (u = -${fMag} cm): Reflected rays emerge parallel; image forms at infinity.`
    : `Concave Mirror Formula: 1/f = 1/v + 1/u  =>  v = ${v} cm,  m = ${m} (${imageNature})`;

  return {
    focalLengthCm: -fMag,
    magnitudeFocalLengthCm: fMag,
    radiusOfCurvatureCm: 2 * fMag,
    objectDistanceCm: uMag,
    objectHeightCm: hO,
    imageDistanceCm: v,
    imageHeightCm: hI,
    linearMagnification: m,
    imageNature,
    imageCategory,
    isReal: uMag > fMag && !isAtInfinity,
    isVirtual: uMag < fMag,
    isAtInfinity,
    canCatchOnScreen: uMag > fMag && !isAtInfinity,
    focalMarkers: {
      P: Number(benchX.toFixed(1)),
      F: Number((benchX - fMag).toFixed(1)),
      C: Number((benchX - 2 * fMag).toFixed(1)),
    },
    rayPaths,
    formulaSummary,
    assumptions: [
      'Paraxial Ray Approximation: Rays make small angles with principal axis.',
      'Spherical aperture is small compared to radius of curvature R.',
      'Reflecting surface is clean and specularly reflective.',
      'Standard Cartesian sign convention: incident direction is positive.',
    ],
  };
}

/**
 * Calculates Convex Mirror Optics:
 * Mirror Formula:
 * 1/f = 1/v + 1/u  where f = +|f|, u = -d_obj
 * => 1/v = 1/|f| - 1/(-d_obj) = 1/|f| + 1/d_obj = (d_obj + |f|) / (d_obj * |f|)
 * => v = (d_obj * |f|) / (d_obj + |f|) > 0 (Always virtual, erect, diminished behind mirror)
 * Magnification: m = -v/u = v / d_obj = |f| / (d_obj + |f|) in (0, 1)
 */
export function calculateConvexMirror(params: {
  focalLengthCm: number;
  objectDistanceCm: number;
  objectHeightCm?: number;
  benchPositionCm?: number;
}): SphericalMirrorResult {
  const fMag = Math.max(2.0, Math.abs(params.focalLengthCm || 15.0));
  const uMag = Math.max(1.0, Math.abs(params.objectDistanceCm || 30.0));
  const hO = Math.max(1.0, params.objectHeightCm ?? 4.0);
  const benchX = params.benchPositionCm ?? 75.0;

  // Always virtual, erect, diminished behind mirror
  const v = Number(((uMag * fMag) / (uMag + fMag)).toFixed(2));
  const m = Number((v / uMag).toFixed(2));
  const hI = Number((m * hO).toFixed(2));

  const pxScale = 3.5;
  const mirrorCanvasX = 300;
  const axisY = 110;

  const objCanvasX = mirrorCanvasX - uMag * pxScale;
  const objTopY = axisY - hO * pxScale;
  const fCanvasX = mirrorCanvasX + fMag * pxScale; // Behind mirror (right)
  const cCanvasX = mirrorCanvasX + 2 * fMag * pxScale; // Behind mirror (right)

  const imgCanvasX = mirrorCanvasX + v * pxScale;
  const imgTipY = axisY - hI * pxScale; // erect: imgTipY < axisY

  const rayPaths: OpticalRayPath[] = [];

  // Ray 1: Parallel to axis, reflects upward as if diverging from focus F behind mirror
  const slopeF = (axisY - objTopY) / (fCanvasX - mirrorCanvasX);
  const refl1X = mirrorCanvasX - 80;
  const refl1Y = objTopY - slopeF * 80;

  rayPaths.push({
    id: 'ray-1',
    name: 'Parallel Ray (diverges from virtual Focus F)',
    points: [objCanvasX, objTopY, mirrorCanvasX, objTopY, refl1X, refl1Y],
    virtualPoints: [mirrorCanvasX, objTopY, imgCanvasX, imgTipY, fCanvasX, axisY],
    color: '#ef4444',
  });

  // Ray 2: Directed towards center of curvature C behind mirror, reflects back on itself
  const slopeC = (axisY - objTopY) / (cCanvasX - objCanvasX);
  const hitY = objTopY + slopeC * (mirrorCanvasX - objCanvasX);
  const refl2X = objCanvasX - 30;
  const refl2Y = objTopY - slopeC * 30;

  rayPaths.push({
    id: 'ray-2',
    name: 'Center Ray (directed towards C, reflects back)',
    points: [objCanvasX, objTopY, mirrorCanvasX, hitY, refl2X, refl2Y],
    virtualPoints: [mirrorCanvasX, hitY, imgCanvasX, imgTipY, cCanvasX, axisY],
    color: '#3b82f6',
  });

  const formulaSummary = `Convex Mirror: 1/f = 1/v + 1/u  =>  v = +${v} cm,  m = +${m} (Virtual, Erect, Diminished)`;

  return {
    focalLengthCm: fMag,
    magnitudeFocalLengthCm: fMag,
    radiusOfCurvatureCm: 2 * fMag,
    objectDistanceCm: uMag,
    objectHeightCm: hO,
    imageDistanceCm: v,
    imageHeightCm: hI,
    linearMagnification: m,
    imageNature: 'Virtual, Erect',
    imageCategory: 'convex-virtual',
    isReal: false,
    isVirtual: true,
    isAtInfinity: false,
    canCatchOnScreen: false,
    focalMarkers: {
      P: Number(benchX.toFixed(1)),
      F: Number((benchX + fMag).toFixed(1)),
      C: Number((benchX + 2 * fMag).toFixed(1)),
    },
    rayPaths,
    formulaSummary,
    assumptions: [
      'Paraxial Ray Approximation for small aperture mirrors.',
      'Reflecting surface is convex spherical.',
      'Virtual image is formed behind the mirror and cannot be projected on a screen.',
      'Auxiliary convex lens method is used in laboratory verification to locate virtual focus.',
    ],
  };
}

export interface ConcaveLensResult {
  focalLengthCm: number; // Signed: negative for diverging lens
  magnitudeFocalLengthCm: number; // |f|
  objectDistanceCm: number; // Magnitude d_obj
  objectHeightCm: number; // h_o
  imageDistanceCm: number; // Signed v: negative (virtual on incident side)
  imageHeightCm: number; // Signed h_i: positive (erect)
  linearMagnification: number; // m = v/u in (0, 1)
  imageNature: 'Virtual, Erect';
  isVirtual: boolean;
  rayPaths: OpticalRayPath[];
  formulaSummary: string;
  auxiliaryLensMethod: {
    auxiliaryConvexFocalLengthCm: number;
    combinedFocalLengthCm: number;
    formula: string;
  };
  assumptions: string[];
}

/**
 * Calculates Concave (Diverging) Lens Optics:
 * Thin Lens Formula:
 * 1/f = 1/v - 1/u  where f = -|f|, u = -d_obj
 * => 1/v = 1/f + 1/u = -1/|f| - 1/d_obj = -(d_obj + |f|) / (d_obj * |f|)
 * => v = -(d_obj * |f|) / (d_obj + |f|) < 0 (Always virtual, erect, diminished on incident side)
 * Magnification: m = v/u = (-|v|) / (-d_obj) = |v| / d_obj = |f| / (d_obj + |f|) in (0, 1)
 */
export function calculateConcaveLens(params: {
  focalLengthCm: number;
  objectDistanceCm: number;
  objectHeightCm?: number;
  auxiliaryConvexFocalLengthCm?: number;
}): ConcaveLensResult {
  const fMag = Math.max(2.0, Math.abs(params.focalLengthCm || 15.0));
  const uMag = Math.max(1.0, Math.abs(params.objectDistanceCm || 30.0));
  const hO = Math.max(1.0, params.objectHeightCm ?? 4.0);
  const auxF = Math.max(5.0, params.auxiliaryConvexFocalLengthCm ?? 10.0);

  // Virtual image formed on incident side (left of lens, v < 0)
  const v = -Number(((uMag * fMag) / (uMag + fMag)).toFixed(2));
  const m = Number((Math.abs(v) / uMag).toFixed(2));
  const hI = Number((m * hO).toFixed(2));

  // Combination formula with auxiliary convex lens (F_comb):
  // 1/F_comb = 1/f_convex + 1/f_concave = 1/auxF - 1/fMag
  const combF = (auxF * fMag) / (fMag - auxF);

  const pxScale = 3.5;
  const lensCanvasX = 300;
  const axisY = 110;

  const objCanvasX = lensCanvasX - uMag * pxScale;
  const objTopY = axisY - hO * pxScale;
  const f1CanvasX = lensCanvasX - fMag * pxScale; // Front focus on left

  const imgCanvasX = lensCanvasX - Math.abs(v) * pxScale;
  const imgTipY = axisY - hI * pxScale; // erect: imgTipY < axisY

  const rayPaths: OpticalRayPath[] = [];

  // Ray 1: Parallel to axis, refracts diverging outward as if from F1
  const slopeDiv = (axisY - objTopY) / (lensCanvasX - f1CanvasX);
  const fwdX = lensCanvasX + 120;
  const fwdY = objTopY - slopeDiv * 120;

  rayPaths.push({
    id: 'ray-1',
    name: 'Parallel Ray (diverges from front focus F₁)',
    points: [objCanvasX, objTopY, lensCanvasX, objTopY, fwdX, fwdY],
    virtualPoints: [lensCanvasX, objTopY, imgCanvasX, imgTipY, f1CanvasX, axisY],
    color: '#ef4444',
  });

  // Ray 2: Central ray through optical center O, continues undeviated
  const slopeO = (axisY - objTopY) / (lensCanvasX - objCanvasX);
  const ray2X = lensCanvasX + 120;
  const ray2Y = axisY + slopeO * 120;

  rayPaths.push({
    id: 'ray-2',
    name: 'Central Ray (through Optical Center O)',
    points: [objCanvasX, objTopY, lensCanvasX, axisY, ray2X, ray2Y],
    color: '#3b82f6',
  });

  const formulaSummary = `Concave Lens: 1/f = 1/v - 1/u  =>  v = ${v} cm,  m = +${m} (Virtual, Erect, Diminished)`;

  return {
    focalLengthCm: -fMag,
    magnitudeFocalLengthCm: fMag,
    objectDistanceCm: uMag,
    objectHeightCm: hO,
    imageDistanceCm: v,
    imageHeightCm: hI,
    linearMagnification: m,
    imageNature: 'Virtual, Erect',
    isVirtual: true,
    rayPaths,
    formulaSummary,
    auxiliaryLensMethod: {
      auxiliaryConvexFocalLengthCm: auxF,
      combinedFocalLengthCm: Number(combF.toFixed(2)),
      formula: '1/F_comb = 1/f_convex - 1/f_concave  =>  1/f_concave = 1/f_convex - 1/F_comb',
    },
    assumptions: [
      'Thin lens approximation (thickness t << |f|).',
      'Paraxial ray conditions satisfied.',
      'Homogeneous glass of refractive index n ≈ 1.52.',
      'Auxiliary convex lens combination is used in laboratory to project real image.',
    ],
  };
}

export interface PrismRefractionResult {
  prismAngleDeg: number; // Angle of prism A (typically 60 deg)
  refractiveIndexMu: number; // Glass refractive index mu (e.g. 1.52 for crown glass)
  angleOfIncidenceDeg: number; // i1
  firstRefractionAngleDeg: number; // r1
  secondIncidentAngleDeg: number; // r2 = A - r1
  angleOfEmergenceDeg: number; // i2
  angleOFDeviationDeg: number; // D = i1 + i2 - A
  minimumDeviationDeg: number; // Dm
  isMinimumDeviation: boolean; // |D - Dm| <= 0.5 deg
  isTotalInternalReflection: boolean; // r2 > criticalAngle
  criticalAngleDeg: number; // theta_c = arcsin(1/mu)
  calculatedRefractiveIndex: number; // mu = sin((A + Dm)/2) / sin(A/2)
  curvePoints: Array<{ angleOfIncidence: number; angleOfDeviation: number }>;
  status: string;
}

/**
 * Calculates Prism Refraction and Minimum Deviation:
 * Snell's Law at Face 1: sin(i1) = mu * sin(r1)  =>  r1 = arcsin(sin(i1) / mu)
 * Interior angle: r2 = A - r1
 * Critical Angle: theta_c = arcsin(1 / mu)
 * If r2 > theta_c: Total Internal Reflection occurs at second face (no emergent ray)
 * Snell's Law at Face 2: mu * sin(r2) = sin(i2)  =>  i2 = arcsin(mu * sin(r2))
 * Total Deviation: D = i1 + i2 - A
 * Minimum Deviation Condition: i1 = i2 = i_m, r1 = r2 = A/2
 * mu = sin((A + Dm)/2) / sin(A/2)
 */
export function calculatePrismRefraction(params: {
  angleOfIncidenceDeg: number;
  prismAngleDeg?: number;
  refractiveIndex?: number;
}): PrismRefractionResult {
  const aDeg = params.prismAngleDeg ?? 60.0;
  const mu = Math.max(1.1, params.refractiveIndex ?? 1.52);
  const i1Deg = Math.max(25.0, Math.min(85.0, params.angleOfIncidenceDeg));

  const aRad = (aDeg * Math.PI) / 180.0;
  const i1Rad = (i1Deg * Math.PI) / 180.0;

  // Critical angle theta_c = arcsin(1 / mu)
  const criticalAngleRad = Math.asin(1.0 / mu);
  const criticalAngleDeg = (criticalAngleRad * 180.0) / Math.PI;

  // Snell's Law at Face 1: sin(i1) = mu * sin(r1)
  const sinR1 = Math.sin(i1Rad) / mu;
  const r1Rad = Math.asin(Math.min(1.0, sinR1));
  const r1Deg = (r1Rad * 180.0) / Math.PI;

  // Angle inside prism at Face 2: r2 = A - r1
  const r2Rad = aRad - r1Rad;
  const r2Deg = (r2Rad * 180.0) / Math.PI;

  const isTir = r2Rad > criticalAngleRad;

  let i2Deg = 0;
  let devDeg = 0;

  if (!isTir && r2Rad >= 0) {
    const sinI2 = mu * Math.sin(r2Rad);
    if (sinI2 <= 1.0) {
      const i2Rad = Math.asin(sinI2);
      i2Deg = (i2Rad * 180.0) / Math.PI;
      devDeg = i1Deg + i2Deg - aDeg;
    } else {
      devDeg = 90.0;
    }
  } else {
    devDeg = 90.0; // TIR boundary indicator
  }

  // Theoretical Minimum Deviation Dm:
  // At Dm: r1 = r2 = A / 2  =>  sin((A + Dm)/2) = mu * sin(A/2)
  const sinHalfA = Math.sin(aRad / 2.0);
  const sinHalfDm = mu * sinHalfA;
  const dmRad = 2.0 * Math.asin(Math.min(1.0, sinHalfDm)) - aRad;
  const dmDeg = (dmRad * 180.0) / Math.PI;

  // Calculated refractive index from Dm formula:
  const calculatedMu = Math.sin((aRad + dmRad) / 2.0) / Math.sin(aRad / 2.0);

  const isMinimumDeviation = Math.abs(devDeg - dmDeg) <= 0.6;

  // Generate 9 sample points for i vs D plot (30 to 70 deg)
  const curvePoints: Array<{ angleOfIncidence: number; angleOfDeviation: number }> = [];
  for (let iSample = 30; iSample <= 70; iSample += 5) {
    const sI1Rad = (iSample * Math.PI) / 180.0;
    const sR1Rad = Math.asin(Math.sin(sI1Rad) / mu);
    const sR2Rad = aRad - sR1Rad;
    if (sR2Rad < criticalAngleRad && sR2Rad >= 0) {
      const sSinI2 = mu * Math.sin(sR2Rad);
      if (sSinI2 <= 1.0) {
        const sI2Rad = Math.asin(sSinI2);
        const sDev = iSample + (sI2Rad * 180.0) / Math.PI - aDeg;
        curvePoints.push({
          angleOfIncidence: iSample,
          angleOfDeviation: Number(sDev.toFixed(1)),
        });
      }
    }
  }

  const status = isTir
    ? `TOTAL INTERNAL REFLECTION! r₂ = ${r2Deg.toFixed(1)}° > θ_c (${criticalAngleDeg.toFixed(1)}°)`
    : isMinimumDeviation
      ? `MINIMUM DEVIATION REACHED! D = Dm = ${devDeg.toFixed(1)}° (i = e = ${i1Deg.toFixed(1)}°, r = ${r1Deg.toFixed(1)}°)`
      : `Refraction: i₁ = ${i1Deg.toFixed(1)}°, r₁ = ${r1Deg.toFixed(1)}°, r₂ = ${r2Deg.toFixed(1)}°, e = ${i2Deg.toFixed(1)}° => D = ${devDeg.toFixed(1)}°`;

  return {
    prismAngleDeg: aDeg,
    refractiveIndexMu: mu,
    angleOfIncidenceDeg: Number(i1Deg.toFixed(1)),
    firstRefractionAngleDeg: Number(r1Deg.toFixed(1)),
    secondIncidentAngleDeg: Number(r2Deg.toFixed(1)),
    angleOfEmergenceDeg: Number(i2Deg.toFixed(1)),
    angleOFDeviationDeg: Number(devDeg.toFixed(1)),
    minimumDeviationDeg: Number(dmDeg.toFixed(1)),
    isMinimumDeviation,
    isTotalInternalReflection: isTir,
    criticalAngleDeg: Number(criticalAngleDeg.toFixed(1)),
    calculatedRefractiveIndex: Number(calculatedMu.toFixed(3)),
    curvePoints,
    status,
  };
}

export interface DiodeCharacteristicsResult {
  semiconductorMaterial: 'silicon' | 'germanium';
  biasMode: 'forward' | 'reverse';
  kneeVoltageVolts: number; // Vk (0.7V for Si, 0.3V for Ge)
  appliedVoltageVolts: number;
  diodeVoltageVolts: number; // Voltage drop across diode VD
  circuitCurrentMilliAmps: number; // IF in mA or IR converted to mA
  circuitCurrentMicroAmps: number; // IR in uA
  dynamicResistanceOhms: number; // r_ac = dV / dI
  staticResistanceOhms: number; // R_dc = V / I
  isBreakdown: boolean; // Reverse breakdown occurred
  isConducting: boolean; // Forward current flowing significantly
  ivCurvePoints: Array<{ voltage: number; currentMilliAmps: number }>;
  status: string;
}

/**
 * Calculates P-N Junction Diode I-V Characteristics:
 * Forward Bias:
 * - Silicon knee threshold: Vk ~ 0.7 V
 * - Germanium knee threshold: Vk ~ 0.3 V
 * - Below Vk: negligible current (< 0.1 mA)
 * - Above Vk: current increases rapidly: IF = (V_applied - Vk) / (r_d + Rs)
 * Reverse Bias:
 * - Minor saturation leakage current: I0 ~ 0.1 uA (Si) to 2.0 uA (Ge)
 * - Zener/Avalanche breakdown threshold: Vbr ~ 25.0 V
 */
export function calculateDiodeCharacteristics(params: {
  semiconductorMaterial: 'silicon' | 'germanium';
  biasMode: 'forward' | 'reverse';
  appliedVoltageVolts: number;
  seriesResistanceOhms?: number;
}): DiodeCharacteristicsResult {
  const mat = params.semiconductorMaterial;
  const mode = params.biasMode;
  const vApplied = Math.max(0.0, params.appliedVoltageVolts);
  const rSeries = Math.max(10.0, params.seriesResistanceOhms ?? 100.0);

  const vk = mat === 'silicon' ? 0.7 : 0.3;
  const vBreakdown = 25.0; // Reverse breakdown voltage in Volts

  let vDiode = 0;
  let currMa = 0;
  let currUa = 0;
  let rDyn = 25.0;
  let isBreakdown = false;
  let isConducting = false;

  if (mode === 'forward') {
    if (vApplied < vk) {
      // Sub-threshold region: exponential micro-current
      const subRatio = vApplied / vk;
      currMa = 0.05 * Math.pow(subRatio, 3.5);
      vDiode = vApplied - (currMa * 1e-3) * rSeries;
      rDyn = currMa > 0.001 ? 26.0 / currMa : 10000.0;
      isConducting = false;
    } else {
      // Conduction region above knee voltage
      // Diode internal dynamic resistance: ~ 15-20 Ohm
      const rInternal = mat === 'silicon' ? 15.0 : 10.0;
      const totalR = rSeries + rInternal;
      currMa = ((vApplied - vk) / totalR) * 1000.0;
      vDiode = vk + (currMa * 1e-3) * rInternal;
      rDyn = rInternal;
      isConducting = true;
    }
    currUa = currMa * 1000.0;
  } else {
    // Reverse bias mode
    const i0Ua = mat === 'silicon' ? 0.15 : 2.5; // Reverse saturation current

    if (vApplied < vBreakdown) {
      currUa = i0Ua * (1.0 - Math.exp(-vApplied / 1.5)) + (vApplied / 50000000.0) * 1e6;
      currMa = currUa * 1e-3;
      vDiode = vApplied;
      rDyn = 500000.0;
      isBreakdown = false;
    } else {
      // Avalanche breakdown
      const overV = vApplied - vBreakdown;
      currUa = i0Ua + (overV / 50.0) * 1000.0; // Sharp surge in uA
      currMa = currUa * 1e-3;
      vDiode = vBreakdown + overV * 0.05;
      rDyn = 50.0;
      isBreakdown = true;
    }
  }

  const staticR = currMa > 0.0001 ? (vDiode / (currMa * 1e-3)) : 999999.0;

  // Generate 8-point I-V curve for charting
  const ivCurvePoints: Array<{ voltage: number; currentMilliAmps: number }> = [];
  if (mode === 'forward') {
    const maxV = Math.max(1.5, vApplied * 1.2);
    for (let vStep = 0.0; vStep <= maxV; vStep += maxV / 7.0) {
      if (vStep < vk) {
        ivCurvePoints.push({
          voltage: Number(vStep.toFixed(2)),
          currentMilliAmps: Number((0.05 * Math.pow(vStep / vk, 3.5)).toFixed(2)),
        });
      } else {
        const iF = ((vStep - vk) / (rSeries + 15.0)) * 1000.0;
        ivCurvePoints.push({
          voltage: Number(vStep.toFixed(2)),
          currentMilliAmps: Number(iF.toFixed(2)),
        });
      }
    }
  } else {
    const maxV = Math.max(30.0, vApplied * 1.1);
    for (let vStep = 0.0; vStep <= maxV; vStep += maxV / 7.0) {
      if (vStep < vBreakdown) {
        ivCurvePoints.push({
          voltage: Number((-vStep).toFixed(1)),
          currentMilliAmps: Number((-0.00015 * Math.sqrt(vStep + 0.1)).toFixed(4)),
        });
      } else {
        const iR = -0.00015 - ((vStep - vBreakdown) / 50.0);
        ivCurvePoints.push({
          voltage: Number((-vStep).toFixed(1)),
          currentMilliAmps: Number(iR.toFixed(2)),
        });
      }
    }
  }

  const status =
    mode === 'forward'
      ? isConducting
        ? `FORWARD CONDUCTION: V_D = ${vDiode.toFixed(2)} V (> Knee ${vk} V) => I_F = ${currMa.toFixed(2)} mA (r_ac = ${rDyn.toFixed(1)} Ω)`
        : `SUB-THRESHOLD: V_D = ${vDiode.toFixed(2)} V (< Knee ${vk} V) => I_F = ${currMa.toFixed(3)} mA (Negligible conduction)`
      : isBreakdown
        ? `REVERSE BREAKDOWN! V_applied = ${vApplied.toFixed(1)} V >= V_br (${vBreakdown} V) => Avalanche I_R = ${currUa.toFixed(1)} µA`
        : `REVERSE SATURATION: V_applied = ${vApplied.toFixed(1)} V => I_R = ${currUa.toFixed(2)} µA (Leakage current only)`;

  return {
    semiconductorMaterial: mat,
    biasMode: mode,
    kneeVoltageVolts: vk,
    appliedVoltageVolts: Number(vApplied.toFixed(2)),
    diodeVoltageVolts: Number(vDiode.toFixed(2)),
    circuitCurrentMilliAmps: Number(currMa.toFixed(3)),
    circuitCurrentMicroAmps: Number(currUa.toFixed(1)),
    dynamicResistanceOhms: Number(rDyn.toFixed(1)),
    staticResistanceOhms: Number(staticR.toFixed(1)),
    isBreakdown,
    isConducting,
    ivCurvePoints,
    status,
  };
}
