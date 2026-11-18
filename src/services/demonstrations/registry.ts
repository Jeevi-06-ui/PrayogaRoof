/**
 * registry.ts
 *
 * Central Demonstration Script Registry for PrayogaProof Virtual Laboratories.
 * Maps experiment identifiers to their verified canvas demonstration scripts.
 */

import { DemoScript } from './controller';
import { ohmsLawDemo } from './ohmsLaw';

// Initial synchronous registry of verified demonstration scripts
const demonstrationRegistry: Record<string, DemoScript> = {
  'ohms-law': ohmsLawDemo,
};

/**
 * Register a demonstration script dynamically
 */
export function registerDemonstrationScript(experimentId: string, script: DemoScript): void {
  demonstrationRegistry[experimentId] = script;
}

/**
 * Retrieve a registered demonstration script by experiment ID
 */
export function getDemonstrationScript(experimentId: string): DemoScript | undefined {
  return demonstrationRegistry[experimentId];
}

/**
 * Check whether a verified canvas demonstration script exists for this experiment
 */
export function hasDemonstrationScript(experimentId: string): boolean {
  return !!demonstrationRegistry[experimentId];
}

/**
 * Return all experiment IDs that have registered canvas demonstrations
 */
export function getAllRegisteredDemonstrationIds(): string[] {
  return Object.keys(demonstrationRegistry);
}
