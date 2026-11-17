/**
 * Physics Model: Simple Pendulum Mechanics & Harmonic Motion
 * Standard Curriculum Model (CBSE / ICSE / NCERT / State Boards):
 * 
 * Equations of Motion:
 * d^2(theta)/dt^2 + (g / L) * sin(theta) = 0
 * 
 * Key Physical Principles:
 * 1. Mass Independence: Bob mass (m) cancels out identically because inertial mass equals gravitational mass.
 *    Changing mass has ZERO effect on period T (dT/dm = 0).
 * 2. Small-Angle Approximation: For theta_0 <= 15 degrees (~0.26 rad), sin(theta) ~ theta with < 0.5% error.
 *    Motion reduces to simple harmonic motion (SHM):
 *    theta(t) = theta_0 * cos(omega_0 * t)
 * 3. Ideal Natural Angular Frequency: omega_0 = sqrt(g / L)
 * 4. Ideal Small-Angle Period: T_0 = 2 * pi * sqrt(L / g)
 * 5. Natural Frequency: f = 1 / T_0
 * 6. Experimental Determination of g: g_calc = 4 * pi^2 * L / T^2
 */

export interface PendulumConfig {
  lengthMeters: number; // string length L in meters (e.g. 0.20m to 1.50m)
  massKg: number; // bob mass m in kg (e.g. 0.05kg to 0.50kg) - STRICTLY INDEPENDENT OF T
  initialAngleDeg: number; // release amplitude theta_0 in degrees (default 10 deg)
  gravity?: number; // g in m/s^2 (default 9.80 m/s^2)
  damping?: number; // damping coefficient gamma (0 for ideal frictionless)
}

export interface PendulumState {
  lengthMeters: number;
  massKg: number;
  initialAngleDeg: number;
  initialAngleRad: number;
  gravity: number;
  // Dynamic parameters
  period: number; // T_0 in seconds
  periodExact: number; // T with finite-amplitude first-order correction
  frequency: number; // f in Hz
  angularFrequency: number; // omega in rad/s
  // Instantaneous state at time t
  elapsedSeconds: number;
  currentAngleDeg: number;
  currentAngleRad: number;
  completedCycles: number;
  currentPhaseDeg: number;
  // Waveform history for graphing
  timeSeries: { time: number; angleDeg: number; angleRad: number }[];
  calculatedGravity: number; // g = 4*pi^2*L / T^2
  assumptions: string[];
  formulaSummary: string;
}

export const STANDARD_GRAVITY = 9.80665; // m/s^2

/**
 * Calculates pendulum period strictly based on length and gravity.
 * NOTE: Mass (m) is NEVER used in the period formula because inertial mass = gravitational mass.
 */
export function calculatePendulumPeriod(lengthMeters: number, gravity = STANDARD_GRAVITY): number {
  const L = Math.max(0.01, lengthMeters);
  const g = Math.max(0.1, gravity);
  return 2 * Math.PI * Math.sqrt(L / g);
}

/**
 * Calculates finite-amplitude corrected period using first-order Legendre series:
 * T = T_0 * (1 + 1/16 * theta_0^2)
 */
export function calculateFiniteAmplitudePeriod(
  lengthMeters: number,
  amplitudeDeg: number,
  gravity = STANDARD_GRAVITY
): number {
  const T0 = calculatePendulumPeriod(lengthMeters, gravity);
  const theta0Rad = (Math.abs(amplitudeDeg) * Math.PI) / 180;
  const correction = 1 + (1 / 16) * Math.pow(theta0Rad, 2);
  return T0 * correction;
}

/**
 * Full dynamic simulation of the simple pendulum at an arbitrary elapsed time t
 */
export function calculatePendulumState(
  config: PendulumConfig,
  elapsedSeconds = 0,
  historyDuration = 4.0, // seconds for wave graph
  historySamples = 100
): PendulumState {
  const L = Math.max(0.05, config.lengthMeters || 0.8);
  const m = Math.max(0.01, config.massKg || 0.1);
  const theta0Deg = config.initialAngleDeg ?? 10;
  const theta0Rad = (theta0Deg * Math.PI) / 180;
  const g = config.gravity ?? STANDARD_GRAVITY;
  const gamma = Math.max(0, config.damping ?? 0);

  // Ideal small-angle period and frequencies
  const period = calculatePendulumPeriod(L, g);
  const periodExact = calculateFiniteAmplitudePeriod(L, theta0Deg, g);
  const frequency = 1 / period;
  const omega0 = 2 * Math.PI * frequency;

  // Instantaneous angle at elapsedSeconds
  // Under light damping: theta(t) = theta0 * exp(-gamma * t) * cos(omega_d * t)
  const omegaD = gamma > 0 ? Math.sqrt(Math.max(0, omega0 * omega0 - gamma * gamma)) : omega0;
  const decay = Math.exp(-gamma * elapsedSeconds);
  const currentAngleRad = theta0Rad * decay * Math.cos(omegaD * elapsedSeconds);
  const currentAngleDeg = (currentAngleRad * 180) / Math.PI;

  const completedCycles = Math.floor(elapsedSeconds / period);
  const currentPhaseDeg = ((elapsedSeconds % period) / period) * 360;

  // Generate waveform time-series for UI graph
  const timeSeries: { time: number; angleDeg: number; angleRad: number }[] = [];
  const dt = historyDuration / historySamples;
  // Graph starts at max(0, elapsedSeconds - historyDuration) up to elapsedSeconds + window
  const startTime = Math.max(0, elapsedSeconds - historyDuration / 2);
  for (let i = 0; i <= historySamples; i++) {
    const t = startTime + i * dt;
    const tDecay = Math.exp(-gamma * t);
    const aRad = theta0Rad * tDecay * Math.cos(omegaD * t);
    timeSeries.push({
      time: Number(t.toFixed(2)),
      angleDeg: Number(((aRad * 180) / Math.PI).toFixed(2)),
      angleRad: Number(aRad.toFixed(3)),
    });
  }

  // Calculated g from simulated T
  const calculatedGravity = (4 * Math.PI * Math.PI * L) / (period * period);

  return {
    lengthMeters: L,
    massKg: m,
    initialAngleDeg: theta0Deg,
    initialAngleRad: theta0Rad,
    gravity: g,
    period: Number(period.toFixed(3)),
    periodExact: Number(periodExact.toFixed(3)),
    frequency: Number(frequency.toFixed(3)),
    angularFrequency: Number(omega0.toFixed(3)),
    elapsedSeconds: Number(elapsedSeconds.toFixed(2)),
    currentAngleDeg: Number(currentAngleDeg.toFixed(2)),
    currentAngleRad: Number(currentAngleRad.toFixed(3)),
    completedCycles,
    currentPhaseDeg: Number(currentPhaseDeg.toFixed(1)),
    timeSeries,
    calculatedGravity: Number(calculatedGravity.toFixed(2)),
    assumptions: [
      'Inextensible, massless suspension thread.',
      'Spherical bob modeled as a concentrated point mass.',
      'Small-angle approximation sin(theta) ~ theta (valid for theta <= 15 deg).',
      'Rigid immovable knife-edge/clamp support.',
      'Mass independence strictly verified: T is independent of bob mass m.',
    ],
    formulaSummary: `T = 2*pi*sqrt(L/g) = ${period.toFixed(2)}s | f = ${frequency.toFixed(2)}Hz | g = 4*pi^2*L / T^2 = ${calculatedGravity.toFixed(2)} m/s^2`,
  };
}
