/**
 * Chemistry Engine: Substance Conservation, Mixing, Neutralization & Indicator Shifting
 * Curriculum Standard: CBSE Class 10 / ICSE Class 10 / State Boards
 */

import { ContainerLiquidState, MixtureComponent, LiquidTransferResult } from './chemistryTypes';
import { getSubstanceById, evaluateIndicatorColor } from './chemicalRegistry';

export const STANDARD_ROOM_TEMP = 25.0; // °C

/**
 * Creates an empty laboratory container state
 */
export function createEmptyContainer(capacityMl: number): ContainerLiquidState {
  return {
    capacityMl: Math.max(10, capacityMl),
    totalVolumeMl: 0,
    temperatureC: STANDARD_ROOM_TEMP,
    ph: 7.0,
    color: '#e2e8f0', // Translucent empty
    components: [],
    isStirred: true,
    reactionState: 'empty',
    observationText: 'Container is dry and empty.',
    isOverflow: false,
  };
}

/**
 * Creates container state filled with an initial reagent
 */
export function createContainerWithSubstance(
  substanceId: string,
  volumeMl: number,
  capacityMl: number
): ContainerLiquidState {
  const substance = getSubstanceById(substanceId);
  if (!substance) {
    return createEmptyContainer(capacityMl);
  }

  const vol = Math.max(0, Math.min(volumeMl, capacityMl));
  const moles = substance.defaultConcentrationM * (vol / 1000);

  const initialComp: MixtureComponent = {
    substanceId: substance.id,
    substanceName: substance.name,
    volumeMl: vol,
    concentrationM: substance.defaultConcentrationM,
    moles,
  };

  const state: ContainerLiquidState = {
    capacityMl,
    totalVolumeMl: vol,
    temperatureC: STANDARD_ROOM_TEMP,
    ph: substance.basePH,
    color: substance.baseColor,
    components: [initialComp],
    isStirred: true,
    reactionState: 'homogeneous',
    observationText: `${substance.name} (${vol} mL, pH ${substance.basePH.toFixed(1)}).`,
    isOverflow: volumeMl > capacityMl,
  };

  return recomputeMixtureProperties(state);
}

/**
 * Recomputes chemical and physical properties of a mixture
 * Strictly models:
 * 1. Monoprotic Strong Acid (HCl) + Strong Base (NaOH) neutralization
 * 2. Indicator chromic shifts for Turmeric, Red Cabbage, and Universal Indicator
 * 3. Volume additivity and mole conservation
 */
export function recomputeMixtureProperties(state: ContainerLiquidState): ContainerLiquidState {
  if (state.components.length === 0 || state.totalVolumeMl <= 0.001) {
    return {
      ...state,
      totalVolumeMl: 0,
      ph: 7.0,
      color: '#e2e8f0',
      components: [],
      reactionState: 'empty',
      observationText: 'Container is dry and empty.',
    };
  }

  const totalVol = state.components.reduce((sum, c) => sum + c.volumeMl, 0);

  // 1. Calculate moles of H+ and OH-
  let molesHPlus = 0;
  let molesOHMinus = 0;
  let hasStrongAcid = false;
  let hasStrongBase = false;
  let hasWeakAcid = false;
  let hasWeakBase = false;
  let activeIndicator: 'universal' | 'turmeric' | 'red-cabbage' | undefined;

  for (const comp of state.components) {
    const sub = getSubstanceById(comp.substanceId);
    if (!sub) continue;

    if (sub.category === 'strong-acid') {
      molesHPlus += comp.moles;
      hasStrongAcid = true;
    } else if (sub.category === 'weak-acid') {
      // Weak acid provides buffered H+
      molesHPlus += comp.moles * 0.05;
      hasWeakAcid = true;
    } else if (sub.category === 'strong-base') {
      molesOHMinus += comp.moles;
      hasStrongBase = true;
    } else if (sub.category === 'weak-base') {
      molesOHMinus += comp.moles * 0.05;
      hasWeakBase = true;
    } else if (sub.id === 'turmeric-indicator') {
      activeIndicator = 'turmeric';
    } else if (sub.id === 'red-cabbage-indicator') {
      activeIndicator = 'red-cabbage';
    } else if (sub.id === 'universal-indicator') {
      activeIndicator = 'universal';
    }
  }

  // 2. Compute equilibrium pH
  let computedPH = 7.0;
  let reactionState: ContainerLiquidState['reactionState'] = 'homogeneous';
  let tempC = state.temperatureC;

  if (hasStrongAcid && hasStrongBase) {
    // Neutralization reaction: H+ + OH- -> H2O (exothermic)
    const netMolesH = molesHPlus - molesOHMinus;
    const volLiters = totalVol / 1000;

    // Exothermic delta T proportional to neutralized moles
    const neutralizedMoles = Math.min(molesHPlus, molesOHMinus);
    tempC = Number((STANDARD_ROOM_TEMP + (neutralizedMoles / volLiters) * 1.5).toFixed(1));

    if (Math.abs(netMolesH) < 1e-6) {
      computedPH = 7.0;
      reactionState = 'neutralized';
    } else if (netMolesH > 0) {
      const concH = netMolesH / volLiters;
      computedPH = Number((-Math.log10(concH)).toFixed(2));
      computedPH = Math.max(0.5, Math.min(6.9, computedPH));
      reactionState = 'acid-shifted';
    } else {
      const concOH = -netMolesH / volLiters;
      const pOH = -Math.log10(concOH);
      computedPH = Number((14.0 - pOH).toFixed(2));
      computedPH = Math.max(7.1, Math.min(13.8, computedPH));
      reactionState = 'base-shifted';
    }
  } else if (molesHPlus > 0 && molesOHMinus === 0) {
    if (hasStrongAcid) {
      const concH = molesHPlus / (totalVol / 1000);
      computedPH = Number(Math.max(0.8, -Math.log10(concH)).toFixed(2));
    } else {
      // Diluted weak acid
      computedPH = Number((2.5 + Math.log10(100 / Math.max(10, totalVol))).toFixed(2));
    }
    reactionState = 'acid-shifted';
  } else if (molesOHMinus > 0 && molesHPlus === 0) {
    if (hasStrongBase) {
      const concOH = molesOHMinus / (totalVol / 1000);
      const pOH = -Math.log10(concOH);
      computedPH = Number(Math.min(13.5, 14 - pOH).toFixed(2));
    } else if (hasWeakBase) {
      // Weak base
      computedPH = 8.6;
    } else {
      computedPH = 7.5;
    }
    reactionState = 'base-shifted';
  } else {
    computedPH = 7.0;
    reactionState = 'homogeneous';
  }

  // If container holds a single substance without neutralization or multiple reactants, preserve its calibrated basePH
  const nonIndicatorComponents = state.components.filter((c) => {
    const cat = getSubstanceById(c.substanceId)?.category;
    return cat !== 'natural-indicator' && cat !== 'synthetic-indicator';
  });
  if (nonIndicatorComponents.length === 1 && !(hasStrongAcid && hasStrongBase)) {
    const singleSub = getSubstanceById(nonIndicatorComponents[0].substanceId);
    if (
      singleSub &&
      (singleSub.category === 'weak-acid' ||
        singleSub.category === 'weak-base' ||
        singleSub.category === 'salt-solution' ||
        singleSub.category === 'buffer-solution' ||
        singleSub.category === 'neutral')
    ) {
      computedPH = singleSub.basePH;
    }
  }

  // 3. Determine Color based on Active Indicator or Base Substances
  let liquidColor = '#e0f2fe';
  let indicatorLabel = '';

  if (activeIndicator) {
    const shift = evaluateIndicatorColor(activeIndicator, computedPH);
    liquidColor = shift.color;
    indicatorLabel = ` [${shift.label}]`;
  } else if (hasWeakAcid && state.components.some((c) => c.substanceId === 'lemon-juice')) {
    liquidColor = '#fef08a'; // Lemon yellow
  } else {
    liquidColor = '#e0f2fe';
  }

  const isOverflow = totalVol > state.capacityMl;
  let finalComponents = state.components;
  let finalVol = totalVol;

  if (isOverflow) {
    reactionState = 'overflow-alert';
    const retentionFraction = state.capacityMl / totalVol;
    finalVol = state.capacityMl;
    finalComponents = state.components.map((c) => ({
      ...c,
      volumeMl: Number((c.volumeMl * retentionFraction).toFixed(2)),
      moles: c.moles * retentionFraction,
    }));
  }

  // Generate scientific observation text
  let observationText = '';
  if (isOverflow) {
    observationText = `OVERFLOW ALERT! Total liquid (${totalVol.toFixed(1)} mL) exceeds container capacity (${state.capacityMl} mL). Retained volume capped to ${state.capacityMl} mL.`;
  } else if (activeIndicator === 'turmeric') {
    observationText =
      computedPH >= 7.5
        ? `Turmeric Indicator Shift: Deep reddish-brown color confirms alkaline solution (pH ${computedPH}).`
        : `Turmeric Indicator: Retains yellow color in acidic/neutral solution (pH ${computedPH}).`;
  } else if (activeIndicator === 'red-cabbage') {
    observationText = `Red Cabbage Anthocyanin: Color shifted to ${indicatorLabel.trim()} (pH ${computedPH}).`;
  } else if (activeIndicator === 'universal') {
    observationText = `Universal Indicator: Rainbow shift indicates pH ~ ${computedPH}${indicatorLabel}.`;
  } else if (reactionState === 'neutralized') {
    observationText = `Neutralization Complete: Acid and base reacted stoichiometrically to form salt and water (pH ${computedPH}, Temp: ${tempC}°C).`;
  } else {
    observationText = `Aqueous solution: Volume = ${totalVol.toFixed(1)} mL, pH = ${computedPH}, Temp = ${tempC}°C.`;
  }

  return {
    ...state,
    totalVolumeMl: Number(finalVol.toFixed(1)),
    components: finalComponents,
    ph: Number(computedPH.toFixed(2)),
    temperatureC: tempC,
    color: liquidColor,
    indicatorActive: activeIndicator,
    reactionState,
    observationText,
    isOverflow,
  };
}

/**
 * Transfers an exact volume of liquid from a source container into a destination container.
 * Enforces:
 * - Positive non-zero transfer volume
 * - Source volume sufficiency (no negative volumes)
 * - Container capacity limits (detects & manages destination overflow)
 * - Strict conservation of chemical substances: moles(dest) + moles(source) = constant
 */
export function transferLiquid(
  source: ContainerLiquidState,
  dest: ContainerLiquidState,
  volumeMl: number
): LiquidTransferResult {
  // 1. Guard against non-positive transfer request
  if (volumeMl <= 0 || isNaN(volumeMl)) {
    return {
      success: false,
      transferredVolumeMl: 0,
      sourceRemainingMl: source.totalVolumeMl,
      destinationTotalMl: dest.totalVolumeMl,
      overflowOccurred: false,
      overflowVolumeMl: 0,
      sourceNewState: source,
      destinationNewState: dest,
      message: 'Transfer volume must be greater than 0 mL.',
      error: 'INVALID_VOLUME',
    };
  }

  // 2. Guard against empty source
  if (source.totalVolumeMl <= 0 || source.components.length === 0) {
    return {
      success: false,
      transferredVolumeMl: 0,
      sourceRemainingMl: 0,
      destinationTotalMl: dest.totalVolumeMl,
      overflowOccurred: false,
      overflowVolumeMl: 0,
      sourceNewState: source,
      destinationNewState: dest,
      message: 'Source container is completely empty.',
      error: 'SOURCE_EMPTY',
    };
  }

  // 3. Determine actual volume that can be poured
  const actualTransferMl = Math.min(volumeMl, source.totalVolumeMl);
  const transferFraction = actualTransferMl / source.totalVolumeMl;

  // 4. Extract proportional components from source
  const transferredComponents: MixtureComponent[] = [];
  const remainingSourceComponents: MixtureComponent[] = [];

  for (const comp of source.components) {
    const transferredCompVol = comp.volumeMl * transferFraction;
    const remainingCompVol = comp.volumeMl - transferredCompVol;
    const transferredMoles = comp.moles * transferFraction;
    const remainingMoles = comp.moles - transferredMoles;

    if (transferredCompVol > 0.0001) {
      transferredComponents.push({
        substanceId: comp.substanceId,
        substanceName: comp.substanceName,
        volumeMl: transferredCompVol,
        concentrationM: comp.concentrationM,
        moles: transferredMoles,
      });
    }

    if (remainingCompVol > 0.0001) {
      remainingSourceComponents.push({
        substanceId: comp.substanceId,
        substanceName: comp.substanceName,
        volumeMl: remainingCompVol,
        concentrationM: comp.concentrationM,
        moles: remainingMoles,
      });
    }
  }

  // 5. Update source state
  const updatedSourceState: ContainerLiquidState = recomputeMixtureProperties({
    ...source,
    components: remainingSourceComponents,
    totalVolumeMl: Math.max(0, source.totalVolumeMl - actualTransferMl),
  });

  // 6. Merge components into destination container
  const newDestComponents = [...dest.components];

  for (const tComp of transferredComponents) {
    const existing = newDestComponents.find((c) => c.substanceId === tComp.substanceId);
    if (existing) {
      existing.volumeMl += tComp.volumeMl;
      existing.moles += tComp.moles;
    } else {
      newDestComponents.push({ ...tComp });
    }
  }

  // 7. Check for overflow
  const rawDestVolume = dest.totalVolumeMl + actualTransferMl;
  const overflowOccurred = rawDestVolume > dest.capacityMl;
  const overflowVolumeMl = overflowOccurred ? rawDestVolume - dest.capacityMl : 0;

  // Destination liquid is capped to physical rim
  const cappedDestVolume = Math.min(rawDestVolume, dest.capacityMl);

  const updatedDestState: ContainerLiquidState = recomputeMixtureProperties({
    ...dest,
    components: newDestComponents,
    totalVolumeMl: cappedDestVolume,
    isOverflow: overflowOccurred,
  });

  return {
    success: true,
    transferredVolumeMl: Number(actualTransferMl.toFixed(1)),
    sourceRemainingMl: updatedSourceState.totalVolumeMl,
    destinationTotalMl: updatedDestState.totalVolumeMl,
    overflowOccurred,
    overflowVolumeMl: Number(overflowVolumeMl.toFixed(1)),
    sourceNewState: updatedSourceState,
    destinationNewState: updatedDestState,
    message: overflowOccurred
      ? `Transferred ${actualTransferMl.toFixed(1)} mL. Destination OVERFLOWED by ${overflowVolumeMl.toFixed(1)} mL!`
      : `Successfully transferred ${actualTransferMl.toFixed(1)} mL liquid.`,
  };
}

/**
 * Simulates stirring with a glass rod
 */
export function stirContainer(state: ContainerLiquidState): ContainerLiquidState {
  return recomputeMixtureProperties({
    ...state,
    isStirred: true,
  });
}
