/**
 * Physics Model: Thin-Lens Geometrical Optics (Convex Lens)
 * Standard Cartesian Sign Convention (NCERT / CBSE / ICSE curriculum standard):
 * - Optical centre O is the coordinate origin (0, 0).
 * - Light travels from Left to Right along the principal optical axis.
 * - Real object is positioned on the incident side (Left): u < 0 (magnitude d_obj > 0).
 * - Convex lens has real principal focus on the transmission side (Right): f > 0.
 * - Thin Lens Equation: 1/f = 1/v - 1/u => v = (f * u) / (u + f)
 *   In magnitude notation: v = (f * d_obj) / (d_obj - f)
 * - Transverse Linear Magnification: m = v / u = -v / d_obj
 */

export interface LensRayPoint {
  x: number;
  y: number;
}

export interface LensRayPath {
  id: string;
  name: string;
  points: number[]; // [x1, y1, x2, y2, ...]
  virtualPoints?: number[]; // dashed back-traced points for virtual image
  color: string;
}

export interface OpticalSimulationState {
  focalLength: number; // in cm (positive for convex lens)
  objectDistance: number; // magnitude d_obj in cm
  objectHeight: number; // h_o in cm (positive erect)
  benchPosition: number; // position of lens along graduated optical rail (cm)
  imageDistance: number; // v in cm (positive for real on right, negative for virtual on left)
  imageHeight: number; // h_i in cm (negative inverted, positive erect)
  magnification: number; // m = v/u
  imageNature: 'Real, Inverted' | 'Virtual, Erect' | 'At Infinity (Parallel Rays)';
  imageCategory:
    | 'beyond-2f'
    | 'at-2f'
    | 'between-f-and-2f'
    | 'at-f'
    | 'inside-f';
  isReal: boolean;
  isVirtual: boolean;
  isAtInfinity: boolean;
  focalMarkers: {
    F1: number;
    twoF1: number;
    F2: number;
    twoF2: number;
  };
  rayPaths: LensRayPath[];
  formulaSummary: string;
  assumptions: string[];
}

export function calculateThinLens(
  focalLength: number,
  objectDistance: number,
  objectHeight = 4,
  benchPosition = 75
): OpticalSimulationState {
  // Ensure non-zero positive physical values
  const f = Math.max(1, Math.abs(focalLength || 15));
  const uMag = Math.max(0.5, Math.abs(objectDistance || 30));
  const hO = Math.max(1, objectHeight || 4);
  const benchX = Math.max(f * 2, benchPosition || 75);

  const diff = uMag - f;
  const isAtInfinity = Math.abs(diff) < 0.1;

  let v = 0;
  let m = 0;
  let hI = 0;
  let imageNature: 'Real, Inverted' | 'Virtual, Erect' | 'At Infinity (Parallel Rays)' =
    'Real, Inverted';
  let imageCategory:
    | 'beyond-2f'
    | 'at-2f'
    | 'between-f-and-2f'
    | 'at-f'
    | 'inside-f' = 'at-2f';

  if (isAtInfinity) {
    v = 9999;
    m = -9999;
    hI = -9999;
    imageNature = 'At Infinity (Parallel Rays)';
    imageCategory = 'at-f';
  } else if (uMag > f) {
    // Real image formed on transmission side (v > 0)
    v = Number(((f * uMag) / diff).toFixed(2));
    m = Number((-v / uMag).toFixed(2));
    hI = Number((m * hO).toFixed(2));
    imageNature = 'Real, Inverted';

    if (Math.abs(uMag - 2 * f) < 0.2) {
      imageCategory = 'at-2f';
    } else if (uMag > 2 * f) {
      imageCategory = 'beyond-2f';
    } else {
      imageCategory = 'between-f-and-2f';
    }
  } else {
    // Virtual image formed on incident side (v < 0, erect)
    v = Number(((f * uMag) / diff).toFixed(2)); // negative
    m = Number((-v / uMag).toFixed(2)); // positive (> 1)
    hI = Number((m * hO).toFixed(2));
    imageNature = 'Virtual, Erect';
    imageCategory = 'inside-f';
  }

  // Focal markers along optical bench scale
  const focalMarkers = {
    twoF1: Number((benchX - 2 * f).toFixed(1)),
    F1: Number((benchX - f).toFixed(1)),
    F2: Number((benchX + f).toFixed(1)),
    twoF2: Number((benchX + 2 * f).toFixed(1)),
  };

  // Construct Geometrical Ray Tracing Paths (in relative canvas pixel scale)
  // Scale factor: e.g. 5 pixels per cm for clean visualization
  const pxScale = 4.0;
  const lensCanvasX = 300;
  const axisY = 100;

  const objCanvasX = lensCanvasX - uMag * pxScale;
  const objTopY = axisY - hO * pxScale;

  const f1CanvasX = lensCanvasX - f * pxScale;
  const f2CanvasX = lensCanvasX + f * pxScale;

  const rayPaths: LensRayPath[] = [];

  if (isAtInfinity) {
    // Ray 1: Parallel to axis, then through F2 and continuing parallel
    rayPaths.push({
      id: 'ray-1',
      name: 'Parallel Ray (refracts through F₂)',
      points: [
        objCanvasX,
        objTopY,
        lensCanvasX,
        objTopY,
        f2CanvasX,
        axisY,
        f2CanvasX + 180,
        axisY + (axisY - objTopY),
      ],
      color: '#ef4444',
    });

    // Ray 2: Central ray through optical center O
    rayPaths.push({
      id: 'ray-2',
      name: 'Central Ray (passes undeviated through O)',
      points: [
        objCanvasX,
        objTopY,
        lensCanvasX,
        axisY,
        lensCanvasX + 180,
        axisY + (axisY - objTopY),
      ],
      color: '#3b82f6',
    });
  } else if (uMag > f) {
    // Real image position
    const imgCanvasX = lensCanvasX + v * pxScale;
    const imgTipY = axisY - hI * pxScale; // inverted means imgTipY > axisY

    // Ray 1: Parallel ray to lens, then through F2 to image tip
    rayPaths.push({
      id: 'ray-1',
      name: 'Parallel Ray (refracts through F₂)',
      points: [objCanvasX, objTopY, lensCanvasX, objTopY, f2CanvasX, axisY, imgCanvasX, imgTipY],
      color: '#ef4444',
    });

    // Ray 2: Undeviated through optical center O
    rayPaths.push({
      id: 'ray-2',
      name: 'Central Ray (through Optical Center O)',
      points: [objCanvasX, objTopY, lensCanvasX, axisY, imgCanvasX, imgTipY],
      color: '#3b82f6',
    });

    // Ray 3: Through front focus F1 to lens, emerging parallel
    if (uMag > f + 2) {
      // Slope to F1: (axisY - objTopY) / (f1CanvasX - objCanvasX)
      // At lens: y = objTopY + slope * (lensCanvasX - objCanvasX)
      const slope = (axisY - objTopY) / (f1CanvasX - objCanvasX);
      const lensHitY = objTopY + slope * (lensCanvasX - objCanvasX);
      rayPaths.push({
        id: 'ray-3',
        name: 'Focal Ray (through F₁ to emerge parallel)',
        points: [objCanvasX, objTopY, f1CanvasX, axisY, lensCanvasX, lensHitY, imgCanvasX, imgTipY],
        color: '#10b981',
      });
    }
  } else {
    // Virtual image behind object (uMag < f)
    const imgCanvasX = lensCanvasX + v * pxScale; // v is negative, so left of lens
    const imgTipY = axisY - hI * pxScale; // erect, so imgTipY < axisY

    // Ray 1: Parallel to lens, refracts outward along line from F2
    const forwardX = lensCanvasX + 160;
    const slopeOut = (axisY - objTopY) / (lensCanvasX - f2CanvasX);
    const forwardY = objTopY - slopeOut * 160;

    rayPaths.push({
      id: 'ray-1',
      name: 'Refracted Ray 1 (diverges through F₂)',
      points: [objCanvasX, objTopY, lensCanvasX, objTopY, forwardX, forwardY],
      virtualPoints: [lensCanvasX, objTopY, imgCanvasX, imgTipY],
      color: '#ef4444',
    });

    // Ray 2: Central ray from O, diverging forward, dashed back to virtual image
    const forwardRay2X = lensCanvasX + 160;
    const slope2 = (axisY - objTopY) / (lensCanvasX - objCanvasX);
    const forwardRay2Y = axisY + slope2 * 160;

    rayPaths.push({
      id: 'ray-2',
      name: 'Central Ray 2 (through O)',
      points: [objCanvasX, objTopY, lensCanvasX, axisY, forwardRay2X, forwardRay2Y],
      virtualPoints: [lensCanvasX, axisY, imgCanvasX, imgTipY],
      color: '#3b82f6',
    });
  }

  const formulaSummary = isAtInfinity
    ? `Object at Focus (u = -${f} cm): Rays exit parallel; image forms at infinity.`
    : `Thin Lens: 1/f = 1/v - 1/u  =>  v = ${v > 0 ? '+' : ''}${v} cm,  m = ${m > 0 ? '+' : ''}${m} (${imageNature})`;

  return {
    focalLength: f,
    objectDistance: uMag,
    objectHeight: hO,
    benchPosition: benchX,
    imageDistance: v,
    imageHeight: hI,
    magnification: m,
    imageNature,
    imageCategory,
    isReal: uMag > f && !isAtInfinity,
    isVirtual: uMag < f,
    isAtInfinity,
    focalMarkers,
    rayPaths,
    formulaSummary,
    assumptions: [
      'Paraxial Ray Approximation (sin θ ≈ tan θ ≈ θ).',
      'Thin lens assumption: lens thickness t << focal length f.',
      'Homogeneous spherical optical glass (refractive index n ≈ 1.52).',
      'Monochromatic light: chromatic and spherical aberrations are neglected.',
    ],
  };
}
