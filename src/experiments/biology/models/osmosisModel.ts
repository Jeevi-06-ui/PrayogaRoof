/**
 * PrayogaProof Scientific Engine — Osmosis & Cell Water Potential Model
 * Experiment 1 (Flagship)
 *
 * Implements thermodynamic water potential equations:
 * Ψ = Ψs + Ψp
 * Solute potential (van 't Hoff): Ψs = -i · C · R · T
 * Net water flux: Jv = Lp · (ΔΨ)
 */

import {
  OsmosisSimulationParameters,
  OsmosisSimulationResults,
  OsmoticTonicity,
  PlantCellTurgorStatus,
} from '../types/biologyTypes';

// Universal gas constant in L·bar/(mol·K)
const R_GAS_CONSTANT = 0.083145;

export const DEFAULT_OSMOSIS_PARAMS: OsmosisSimulationParameters = {
  externalSoluteConcentrationMolar: 0.0, // pure distilled water
  internalSoluteConcentrationMolar: 0.35, // typical plant vacuolar sap molarity
  temperatureKelvin: 298.15, // 25°C standard room temp
  membraneHydraulicConductivityLp: 2.5, // um/(s·bar)
  reflectionCoefficientSigma: 1.0, // strictly semipermeable
  cellType: 'plant-cell-with-wall',
  elapsedTimeSeconds: 60,
};

/**
 * Calculates solute potential in Megapascals (MPa).
 * 1 bar = 0.1 MPa.
 */
export function calculateSolutePotentialMPa(
  concentrationMolar: number,
  temperatureK: number,
  vanTHoffFactor_i: number = 1.0
): number {
  if (concentrationMolar <= 0) return 0;
  // Ψs = -i · C · R · T (in bar)
  const psi_s_bar = -1 * vanTHoffFactor_i * concentrationMolar * R_GAS_CONSTANT * temperatureK;
  // Convert bar to MPa (1 bar = 0.1 MPa)
  return psi_s_bar * 0.1;
}

/**
 * Evaluates the deterministic state of an osmotic system for a plant cell or RBC.
 */
export function evaluateOsmosisSimulation(
  params: OsmosisSimulationParameters
): OsmosisSimulationResults {
  const {
    externalSoluteConcentrationMolar,
    internalSoluteConcentrationMolar,
    temperatureKelvin,
    cellType,
    elapsedTimeSeconds,
    membraneHydraulicConductivityLp,
    reflectionCoefficientSigma,
  } = params;

  // Compute solute potentials
  const psi_s_ext_mpa = calculateSolutePotentialMPa(externalSoluteConcentrationMolar, temperatureKelvin);
  const psi_s_int_mpa = calculateSolutePotentialMPa(internalSoluteConcentrationMolar, temperatureKelvin);

  // Pressure potential of pure external beaker solution is 0 (atmospheric)
  const psi_p_ext_mpa = 0;
  const waterPotentialExternalMpa = psi_s_ext_mpa + psi_p_ext_mpa;

  // Determine baseline tonicity
  let tonicity: OsmoticTonicity = 'isotonic';
  const deltaC = internalSoluteConcentrationMolar - externalSoluteConcentrationMolar;

  if (Math.abs(deltaC) < 0.01) {
    tonicity = 'isotonic';
  } else if (deltaC > 0) {
    // Internal solute is higher than external => external is Hypotonic
    tonicity = 'hypotonic';
  } else {
    // External solute is higher than internal => external is Hypertonic
    tonicity = 'hypertonic';
  }

  // Kinetics of water flux and volume relaxation:
  // Volume approaches steady state: V(t) = V_inf - (V_inf - V_0) * exp(-k * t)
  const rateConstantK = Math.min(0.15, (membraneHydraulicConductivityLp * reflectionCoefficientSigma * 0.04));
  const timeProgress = 1 - Math.exp(-rateConstantK * Math.max(0, elapsedTimeSeconds));

  let relativeCellVolume = 1.0;
  let turgorPressureBar = 0.0;
  let plantCellState: PlantCellTurgorStatus = 'flaccid';
  let waterPotentialInternalMpa = psi_s_int_mpa;

  if (cellType === 'plant-cell-with-wall') {
    if (tonicity === 'isotonic') {
      relativeCellVolume = 1.0;
      turgorPressureBar = 0.0;
      plantCellState = 'flaccid';
      waterPotentialInternalMpa = psi_s_int_mpa;
    } else if (tonicity === 'hypotonic') {
      // Water flows into the cell
      // As volume expands against rigid wall (up to ~1.12x), wall pressure (turgor Ψp) rises
      const maxVolume = 1.12;
      relativeCellVolume = 1.0 + (maxVolume - 1.0) * timeProgress;

      // Full turgor: Ψp balances the solute potential difference
      const maxTurgorMpa = Math.abs(psi_s_int_mpa - psi_s_ext_mpa);
      const currentTurgorMpa = maxTurgorMpa * timeProgress;
      turgorPressureBar = currentTurgorMpa * 10; // 1 MPa = 10 bar

      waterPotentialInternalMpa = psi_s_int_mpa + currentTurgorMpa;
      plantCellState = timeProgress > 0.6 ? 'turgid' : 'flaccid';
    } else {
      // Hypertonic: Water exits the vacuole, protoplast contracts away from cell wall
      const minPlasmolysedVolume = 0.65;
      relativeCellVolume = 1.0 - (1.0 - minPlasmolysedVolume) * timeProgress;
      turgorPressureBar = 0.0; // turgor pressure drops to 0 immediately upon detachment
      waterPotentialInternalMpa = psi_s_int_mpa * (1 / relativeCellVolume); // solute concentrates

      if (timeProgress < 0.25) {
        plantCellState = 'flaccid';
      } else if (timeProgress < 0.5) {
        plantCellState = 'incipient-plasmolysis';
      } else {
        plantCellState = 'plasmolysed';
      }
    }
  } else {
    // Animal Cell (RBC, no cell wall)
    if (tonicity === 'isotonic') {
      relativeCellVolume = 1.0;
      turgorPressureBar = 0.0;
    } else if (tonicity === 'hypotonic') {
      // Swelling without wall restraint => lysis risk
      relativeCellVolume = 1.0 + 0.45 * timeProgress;
      turgorPressureBar = 0.0;
    } else {
      // Hypertonic => Crenation (shrinkage and spiky appearance)
      relativeCellVolume = 1.0 - 0.40 * timeProgress;
      turgorPressureBar = 0.0;
    }
    plantCellState = 'flaccid';
  }

  // Net water flux Jv (um/s)
  // Positive = net influx, Negative = net efflux
  const deltaWaterPotentialMpa = waterPotentialExternalMpa - waterPotentialInternalMpa;
  const netWaterFluxJv = deltaWaterPotentialMpa * 10 * membraneHydraulicConductivityLp * (1 - timeProgress * 0.9);

  // Solute osmotic pressure in bar
  const osmoticPressureInternalBar = Math.abs(psi_s_int_mpa) * 10;
  const osmoticPressureExternalBar = Math.abs(psi_s_ext_mpa) * 10;

  // Observations & Pedagogical Explanations
  let scientificObservation = '';
  let explanation = '';

  if (tonicity === 'hypotonic') {
    scientificObservation = `External solution is hypotonic (Ψ_ext = ${waterPotentialExternalMpa.toFixed(2)} MPa > Ψ_int = ${waterPotentialInternalMpa.toFixed(2)} MPa). Endosmosis observed. Cell volume expanded to ${(relativeCellVolume * 100).toFixed(1)}%.`;
    explanation = cellType === 'plant-cell-with-wall'
      ? 'Water molecules diffuse down their water potential gradient across the selectively permeable tonoplast and plasma membrane into the vacuole. The protoplast expands, exerting hydrostatic turgor pressure (Ψp) against the rigid cellulosic cell wall until equilibrium (Ψ_cell = Ψ_ext) is achieved.'
      : 'In the absence of a rigid cell wall, osmotic water influx increases hydrostatic membrane tension. Severe hypotonicity leads to osmotic hemolysis (cell lysis).';
  } else if (tonicity === 'hypertonic') {
    scientificObservation = `External solution is hypertonic (Ψ_ext = ${waterPotentialExternalMpa.toFixed(2)} MPa < Ψ_int = ${waterPotentialInternalMpa.toFixed(2)} MPa). Exosmosis observed. Protoplast shrunk to ${(relativeCellVolume * 100).toFixed(1)}% of original volume.`;
    explanation = cellType === 'plant-cell-with-wall'
      ? 'Water moves out of the vacuole into the hypertonic external medium. As water exits, turgor pressure drops to zero. Continued exosmosis causes the protoplast to shrink and detach from the rigid cell wall, leading to incipient and then full plasmolysis.'
      : 'Water moves out of the animal cell rapidly, causing the cell membrane to shrink and form a scalloped or spiky crenated morphology.';
  } else {
    scientificObservation = `External solution is isotonic with the cell sap (ΔΨ ≈ 0 MPa). Dynamic equilibrium maintained. No net water movement.`;
    explanation = 'Water molecules continue to cross the semipermeable membrane in both directions at equal rates. Net water flux (Jv) is zero, preserving cell volume and preventing both plasmolysis and excessive turgor strain.';
  }

  return {
    waterPotentialInternalMpa,
    waterPotentialExternalMpa,
    osmoticPressureInternalBar,
    osmoticPressureExternalBar,
    tonicity,
    netWaterFluxJv,
    relativeCellVolume,
    turgorPressureBar,
    plantCellState,
    scientificObservation,
    explanation,
  };
}
