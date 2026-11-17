/**
 * Physics Model: 2D Magnetic Field & Compass Interaction
 * Model: Finite Two-Pole Magnetic Dipole (Coulomb Law for Magnetic Charges)
 * 
 * Physics:
 * - A bar magnet of length L at center (x_c, y_c) and orientation angle theta has:
 *   North pole at: r_N = (x_c + (L/2)*cos(theta), y_c + (L/2)*sin(theta))
 *   South pole at: r_S = (x_c - (L/2)*cos(theta), y_c - (L/2)*sin(theta))
 * - Magnetic field from pole p with pole strength q_m (+ for North, - for South):
 *   B_p = (mu_0 / 4pi) * q_m * (r - r_p) / (|r - r_p|^2 + epsilon^2)^(3/2)
 * - Net magnetic field at any observation point r = (x, y):
 *   B_net(r) = B_N(r) + B_S(r)
 * - Compass needle angle:
 *   phi = atan2(B_net,y, B_net,x) [North pointer points along B_net]
 */

export interface MagnetConfig {
  id?: string;
  x: number; // canvas center x (px)
  y: number; // canvas center y (px)
  length?: number; // magnet length (px, default 120)
  width?: number; // magnet width (px, default 36)
  angle?: number; // orientation angle in degrees (0 = N pointing East/right)
  poleStrength?: number; // relative pole strength (e.g. 500 to 2000 uT*px^2)
}

export interface MagneticVector {
  x: number;
  y: number;
  bx: number; // uT
  by: number; // uT
  magnitude: number; // |B| in uT
  angleDeg: number; // compass needle orientation in degrees (-180 to 180)
}

export interface FieldLine {
  id: string;
  points: number[]; // flat array [x1, y1, x2, y2, ...]
  arrows: { x: number; y: number; angleDeg: number }[];
}

export interface MagnetSimulationResult {
  magnet: MagnetConfig;
  poles: {
    north: { x: number; y: number };
    south: { x: number; y: number };
  };
  fieldLines: FieldLine[];
  assumptions: string[];
  formulaSummary: string;
}

const EPSILON = 12; // softening radius in pixels to prevent singularity at pole centers
const MU0_4PI = 1.0; // scaling factor for simulation units

/**
 * Calculates net magnetic field vector at observation point (px, py)
 */
export function calculateMagneticField(
  px: number,
  py: number,
  magnets: MagnetConfig[]
): MagneticVector {
  let netBx = 0;
  let netBy = 0;

  for (const mag of magnets) {
    const len = mag.length ?? 120;
    const halfL = len / 2;
    const rad = ((mag.angle ?? 0) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // North pole (+qm) and South pole (-qm) coordinates
    const nx = mag.x + halfL * cosA;
    const ny = mag.y + halfL * sinA;
    const sx = mag.x - halfL * cosA;
    const sy = mag.y - halfL * sinA;

    const qm = (mag.poleStrength ?? 1000) * MU0_4PI;

    // Displacement from North pole to point (pointing away from N)
    const dnx = px - nx;
    const dny = py - ny;
    const distSqN = dnx * dnx + dny * dny + EPSILON * EPSILON;
    const distN3 = Math.pow(distSqN, 1.5);
    const bnx = (qm * dnx) / distN3;
    const bny = (qm * dny) / distN3;

    // Displacement from South pole to point (pointing towards S, so -qm*(r - r_S))
    const dsx = px - sx;
    const dsy = py - sy;
    const distSqS = dsx * dsx + dsy * dsy + EPSILON * EPSILON;
    const distS3 = Math.pow(distSqS, 1.5);
    const bsx = (-qm * dsx) / distS3;
    const bsy = (-qm * dsy) / distS3;

    netBx += bnx + bsx;
    netBy += bny + bsy;
  }

  const magnitude = Math.sqrt(netBx * netBx + netBy * netBy);
  const angleRad = Math.atan2(netBy, netBx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return {
    x: px,
    y: py,
    bx: Number(netBx.toFixed(3)),
    by: Number(netBy.toFixed(3)),
    magnitude: Number(magnitude.toFixed(2)),
    angleDeg: Number(angleDeg.toFixed(1)),
  };
}

/**
 * Calculates needle orientation (in degrees) for a compass at (compassX, compassY)
 */
export function calculateCompassAngle(
  compassX: number,
  compassY: number,
  magnets: MagnetConfig[]
): number {
  if (!magnets || magnets.length === 0) return 0;
  const vec = calculateMagneticField(compassX, compassY, magnets);
  return vec.angleDeg;
}

/**
 * Traces stream lines of magnetic flux for a bar magnet
 */
export function generateMagneticFieldLines(
  magnet: MagnetConfig,
  numLinesPerSide = 4
): FieldLine[] {
  const len = magnet.length ?? 120;
  const halfL = len / 2;
  const magAngle = magnet.angle ?? 0;
  const rad = (magAngle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const nx = magnet.x + halfL * cosA;
  const ny = magnet.y + halfL * sinA;
  const sx = magnet.x - halfL * cosA;
  const sy = magnet.y - halfL * sinA;

  const lines: FieldLine[] = [];
  const magnets = [magnet];

  // Trace field lines starting from North pole perimeter at various angular spreads
  // Angles relative to magnet axis (-90 to +90 degrees)
  const angleOffsets = [];
  for (let i = 1; i <= numLinesPerSide; i++) {
    const frac = i / (numLinesPerSide + 1);
    angleOffsets.push(-80 + frac * 160);
  }

  let lineIdx = 0;
  for (const offsetDeg of angleOffsets) {
    const launchAngle = ((magAngle + offsetDeg) * Math.PI) / 180;
    // Launch point just outside North pole endcap
    const rStart = 16;
    let cx = nx + rStart * Math.cos(launchAngle);
    let cy = ny + rStart * Math.sin(launchAngle);

    const points: number[] = [Number(cx.toFixed(1)), Number(cy.toFixed(1))];
    const arrows: { x: number; y: number; angleDeg: number }[] = [];

    const stepSize = 8;
    const maxSteps = 120;
    let placedArrow = false;

    for (let step = 0; step < maxSteps; step++) {
      // Check if reached South pole vicinity
      const distToSouth = Math.hypot(cx - sx, cy - sy);
      if (distToSouth < 16) {
        points.push(Number(sx.toFixed(1)), Number(sy.toFixed(1)));
        break;
      }

      // Check boundary limits
      if (Math.hypot(cx - magnet.x, cy - magnet.y) > 350) {
        break;
      }

      const field = calculateMagneticField(cx, cy, magnets);
      if (field.magnitude < 0.001) break;

      const stepRad = (field.angleDeg * Math.PI) / 180;
      cx += stepSize * Math.cos(stepRad);
      cy += stepSize * Math.sin(stepRad);

      points.push(Number(cx.toFixed(1)), Number(cy.toFixed(1)));

      // Place direction arrow near the middle of trajectory
      if (!placedArrow && step > 25 && step < 45) {
        arrows.push({
          x: Number(cx.toFixed(1)),
          y: Number(cy.toFixed(1)),
          angleDeg: field.angleDeg,
        });
        placedArrow = true;
      }
    }

    if (points.length >= 6) {
      lines.push({
        id: `field-line-${lineIdx++}`,
        points,
        arrows,
      });
    }
  }

  return lines;
}

/**
 * High-level simulation engine for the magnetic field lab
 */
export function simulateMagneticField(magnet: MagnetConfig): MagnetSimulationResult {
  const len = magnet.length ?? 120;
  const halfL = len / 2;
  const rad = ((magnet.angle ?? 0) * Math.PI) / 180;

  const nx = Number((magnet.x + halfL * Math.cos(rad)).toFixed(1));
  const ny = Number((magnet.y + halfL * Math.sin(rad)).toFixed(1));
  const sx = Number((magnet.x - halfL * Math.cos(rad)).toFixed(1));
  const sy = Number((magnet.y - halfL * Math.sin(rad)).toFixed(1));

  const fieldLines = generateMagneticFieldLines(magnet, 4);

  return {
    magnet,
    poles: {
      north: { x: nx, y: ny },
      south: { x: sx, y: sy },
    },
    fieldLines,
    assumptions: [
      '2D Fictitious Magnetic Pole Model (Coulomb law for magnetic pole charges).',
      'Softening parameter epsilon = 12 px prevents artificial infinite singularities at pole cores.',
      'Field lines emerge from North pole and terminate on South pole externally.',
      'Uniform Alnico/NdFeB permanent magnetization with symmetric pole distribution.',
      'Ambient geomagnetic field is neglected for high local magnetic contrast.',
    ],
    formulaSummary:
      'B_net(r) = (mu_0 / 4pi) * q_m * [ (r - r_N)/|r - r_N|^3 - (r - r_S)/|r - r_S|^3 ]',
  };
}
