import { describe, it, expect } from 'vitest';
import {
  calculateMagneticField,
  calculateCompassAngle,
  generateMagneticFieldLines,
  simulateMagneticField,
  MagnetConfig,
} from '../src/services/physics/magnetismModel';

describe('Physics Model: 2D Magnetic Field & Compass Interaction', () => {
  const horizontalMagnet: MagnetConfig = {
    x: 200,
    y: 200,
    length: 120, // North at (260, 200), South at (140, 200)
    width: 36,
    angle: 0, // N pointing East (+x)
    poleStrength: 1000,
  };

  it('correctly calculates field direction along the magnetic axis', () => {
    // Point east of North pole (e.g. x = 320, y = 200)
    // Field should point predominantly away from North (+x direction, angle ~ 0 deg)
    const fieldEast = calculateMagneticField(320, 200, [horizontalMagnet]);

    expect(fieldEast.bx).toBeGreaterThan(0);
    expect(Math.abs(fieldEast.by)).toBeLessThan(0.01);
    expect(Math.abs(fieldEast.angleDeg)).toBeLessThan(5);

    // Point west of South pole (e.g. x = 80, y = 200)
    // Field should point towards South pole (+x direction, angle ~ 0 deg)
    const fieldWest = calculateMagneticField(80, 200, [horizontalMagnet]);

    expect(fieldWest.bx).toBeGreaterThan(0);
    expect(Math.abs(fieldWest.by)).toBeLessThan(0.01);
  });

  it('correctly calculates field along the equatorial plane (perpendicular bisector)', () => {
    // Point directly north of center (x = 200, y = 100)
    // By dipole geometry, field points antiparallel to magnetic moment (-x direction, angle ~ 180 deg)
    const fieldNorth = calculateMagneticField(200, 100, [horizontalMagnet]);

    expect(fieldNorth.bx).toBeLessThan(0); // directed from N side towards S side
    expect(Math.abs(fieldNorth.by)).toBeLessThan(0.01);
    expect(Math.abs(Math.abs(fieldNorth.angleDeg) - 180)).toBeLessThan(5);
  });

  it('demonstrates inverse distance attenuation of magnetic field strength', () => {
    // Field at distance r1 = 50px from North pole vs r2 = 100px from North pole
    const nx = 260;
    const ny = 200;
    const fieldNear = calculateMagneticField(nx + 40, ny, [horizontalMagnet]);
    const fieldFar = calculateMagneticField(nx + 100, ny, [horizontalMagnet]);

    expect(fieldNear.magnitude).toBeGreaterThan(fieldFar.magnitude * 2);
  });

  it('calculates compass needle orientation angle aligning with net B-vector', () => {
    // Compass placed near North pole
    const angleNorth = calculateCompassAngle(300, 200, [horizontalMagnet]);
    expect(Math.abs(angleNorth)).toBeLessThan(10); // points along +x

    // Compass placed on equatorial axis
    const angleEquator = calculateCompassAngle(200, 120, [horizontalMagnet]);
    expect(Math.abs(Math.abs(angleEquator) - 180)).toBeLessThan(10); // points along -x
  });

  it('generates continuous magnetic field lines emerging from North and entering South', () => {
    const fieldLines = generateMagneticFieldLines(horizontalMagnet, 4);

    expect(fieldLines.length).toBeGreaterThan(0);
    for (const line of fieldLines) {
      expect(line.points.length).toBeGreaterThanOrEqual(6);
      // First point is near North pole (x > 200)
      const startX = line.points[0];
      expect(startX).toBeGreaterThan(200);
    }
  });

  it('responds consistently when magnet is rotated by 90 degrees', () => {
    const verticalMagnet: MagnetConfig = {
      x: 200,
      y: 200,
      length: 120,
      width: 36,
      angle: 90, // North at (200, 260), South at (200, 140)
      poleStrength: 1000,
    };

    // Point below North pole (x = 200, y = 320)
    // Field should point downwards (+y direction, angle ~ 90 deg)
    const fieldBelow = calculateMagneticField(200, 320, [verticalMagnet]);

    expect(fieldBelow.by).toBeGreaterThan(0);
    expect(Math.abs(fieldBelow.angleDeg - 90)).toBeLessThan(5);
  });

  it('produces complete simulation output with stated physical assumptions', () => {
    const sim = simulateMagneticField(horizontalMagnet);

    expect(sim.poles.north.x).toBe(260);
    expect(sim.poles.south.x).toBe(140);
    expect(sim.fieldLines.length).toBeGreaterThan(0);
    expect(sim.assumptions.length).toBeGreaterThanOrEqual(3);
    expect(sim.assumptions.some((a) => a.includes('Coulomb'))).toBe(true);
    expect(sim.formulaSummary).toContain('B_net');
  });
});
