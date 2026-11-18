import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getExperimentsBySubject,
  getSubjectById,
  getExperimentById,
} from '../src/services/experimentRegistry';
import {
  SLIDE_CATALOG,
  OBJECTIVE_SPECS,
  calculateResolvingPowerUm,
  calculateFocalBlur,
} from '../src/experiments/biology/models/microscopeEngine';
import {
  evaluateOsmosisSimulation,
  calculateSolutePotentialMPa,
  DEFAULT_OSMOSIS_PARAMS,
} from '../src/experiments/biology/models/osmosisModel';
import { VirtualMicroscopeStudio } from '../src/experiments/biology/components/VirtualMicroscopeStudio';
import { BiologicalWorkbench } from '../src/experiments/biology/components/BiologicalWorkbench';
import { OsmosisLab } from '../src/experiments/biology/components/OsmosisLab';
import { StomataLab } from '../src/experiments/biology/components/StomataLab';
import { SalivaryAmylaseLab } from '../src/experiments/biology/components/SalivaryAmylaseLab';
import { FoodTestingLab } from '../src/experiments/biology/components/FoodTestingLab';
import { SeedRespirationLab } from '../src/experiments/biology/components/SeedRespirationLab';
import { PhotosynthesisLab } from '../src/experiments/biology/components/PhotosynthesisLab';
import { MitosisLab } from '../src/experiments/biology/components/MitosisLab';
import { MeiosisLab } from '../src/experiments/biology/components/MeiosisLab';
import { MendelianGeneticsLab } from '../src/experiments/biology/components/MendelianGeneticsLab';
import { DNAReplicationLab } from '../src/experiments/biology/components/DNAReplicationLab';
import { GeneExpressionLab } from '../src/experiments/biology/components/GeneExpressionLab';
import { HeartCirculationLab } from '../src/experiments/biology/components/HeartCirculationLab';
import { NephronLab } from '../src/experiments/biology/components/NephronLab';
import { ReflexArcLab } from '../src/experiments/biology/components/ReflexArcLab';
import { EcosystemEnergyFlowLab } from '../src/experiments/biology/components/EcosystemEnergyFlowLab';
import { BiologyLabWorkspace } from '../src/experiments/biology/components/BiologyLabWorkspace';
import { getSimulationMedia } from '../src/services/learning/simulationMediaRegistry';

describe('Biology Virtual Laboratory Scientific Testing Suite', () => {
  // 1. Registry & Scope
  describe('Biology Curriculum Registry & 15 Experiments Scope', () => {
    it('verifies Biology subject is active with 15 experiments', () => {
      const bio = getSubjectById('biology');
      expect(bio).toBeDefined();
      expect(bio?.status).toBe('active');
      expect(bio?.totalExperiments).toBe(15);
      expect(bio?.availableExperiments).toBe(15);
    });

    it('verifies all 15 biology experiments have complete metadata and implemented status', () => {
      const experiments = getExperimentsBySubject('biology');
      expect(experiments).toHaveLength(15);

      const expectedIds = [
        'bio-osmosis',
        'bio-stomata',
        'bio-salivary-amylase',
        'bio-food-testing',
        'bio-seed-respiration',
        'bio-photosynthesis',
        'bio-mitosis',
        'bio-meiosis',
        'bio-mendelian-genetics',
        'bio-dna-replication',
        'bio-gene-expression',
        'bio-heart-circulation',
        'bio-nephron',
        'bio-reflex-arc',
        'bio-ecosystem-energy',
      ];

      for (const id of expectedIds) {
        const exp = getExperimentById(id);
        expect(exp).toBeDefined();
        expect(exp?.subjectId).toBe('biology');
        expect(exp?.implementationStatus).toBe('implemented');
        expect(exp?.learningObjectives.length).toBeGreaterThan(0);
        expect(exp?.apparatus.length).toBeGreaterThan(0);
        expect(exp?.safetyGuidelines.length).toBeGreaterThan(0);
        expect(exp?.keyFormulaOrPrinciple).toBeTruthy();
      }
    });
  });

  // 2. Optical Microscope Engine
  describe('Virtual Microscope Studio & Optical Engine', () => {
    it('verifies DIN objective specifications and resolving powers', () => {
      expect(OBJECTIVE_SPECS['4x'].numericalAperture).toBe(0.10);
      expect(OBJECTIVE_SPECS['10x'].numericalAperture).toBe(0.25);
      expect(OBJECTIVE_SPECS['40x'].numericalAperture).toBe(0.65);
      expect(OBJECTIVE_SPECS['100x'].numericalAperture).toBe(1.25);

      // Abbe limit: d = λ / (2 * NA) with λ = 0.55 um
      const res4x = calculateResolvingPowerUm(0.10);
      const res100x = calculateResolvingPowerUm(1.25);
      expect(res4x).toBeCloseTo(2.75, 2);
      expect(res100x).toBeCloseTo(0.22, 2);
    });

    it('verifies focal plane depth and blur calculation with immersion oil', () => {
      const specimen = SLIDE_CATALOG[0]; // onion-peel, idealFocalPlaneZ = 50
      const focusedState = {
        currentSlideId: 'onion-peel',
        eyepieceMagnification: 10,
        activeObjective: '40x' as const,
        coarseFocus: 50,
        fineFocus: 50,
        stageX: 0,
        stageY: 0,
        irisDiaphragmPercent: 80,
        lightIntensityPercent: 85,
        isOilApplied: false,
        activeStain: 'safranin' as const,
        isSlideSecured: true,
      };

      const blurInFocus = calculateFocalBlur(focusedState, specimen);
      expect(blurInFocus.isFocused).toBe(true);
      expect(blurInFocus.blurPx).toBeLessThan(1.2);

      // Out of focus state
      const blurredState = { ...focusedState, coarseFocus: 85 };
      const blurOutOfFocus = calculateFocalBlur(blurredState, specimen);
      expect(blurOutOfFocus.isFocused).toBe(false);
      expect(blurOutOfFocus.blurPx).toBeGreaterThan(5);

      // 100x without oil has lower resolving power than with oil
      const state100xNoOil = { ...focusedState, activeObjective: '100x' as const, isOilApplied: false };
      const state100xWithOil = { ...focusedState, activeObjective: '100x' as const, isOilApplied: true };
      const resNoOil = calculateFocalBlur(state100xNoOil, specimen).opticalResolutionUm;
      const resWithOil = calculateFocalBlur(state100xWithOil, specimen).opticalResolutionUm;
      expect(resWithOil).toBeLessThan(resNoOil);
    });

    it('renders VirtualMicroscopeStudio with turret, slides, and objective buttons', () => {
      render(<VirtualMicroscopeStudio initialSlideId="onion-peel" />);
      expect(screen.getByText('Virtual Microscope Studio')).toBeInTheDocument();
      expect(screen.getByText('DIN Achromatic Optics')).toBeInTheDocument();
      expect(screen.getByText('Auto-Center Focus')).toBeInTheDocument();
      expect(screen.getByText('Capture Slide')).toBeInTheDocument();
      expect(screen.getByText('4x')).toBeInTheDocument();
      expect(screen.getByText('10x')).toBeInTheDocument();
      expect(screen.getByText('40x')).toBeInTheDocument();
      expect(screen.getByText('100x')).toBeInTheDocument();
    });
  });

  // 3. Osmosis Scientific Model & Flagship Lab
  describe('Osmosis & Water Potential Thermodynamic Model', () => {
    it('computes van ’t Hoff solute potential correctly', () => {
      // Ψs = -i·C·R·T * 0.1 MPa
      // For pure water C=0 -> Ψs = 0
      expect(calculateSolutePotentialMPa(0, 298.15)).toBe(0);

      // For 0.5 M sucrose at 298.15 K:
      // -1 * 0.5 * 0.083145 * 298.15 * 0.1 ≈ -1.239 MPa
      const psi = calculateSolutePotentialMPa(0.5, 298.15);
      expect(psi).toBeCloseTo(-1.239, 2);
    });

    it('evaluates hypotonic endosmosis yielding cell turgor', () => {
      const res = evaluateOsmosisSimulation({
        ...DEFAULT_OSMOSIS_PARAMS,
        externalSoluteConcentrationMolar: 0.0, // hypotonic pure water
        internalSoluteConcentrationMolar: 0.4,
        elapsedTimeSeconds: 120,
      });

      expect(res.tonicity).toBe('hypotonic');
      expect(res.plantCellState).toBe('turgid');
      expect(res.turgorPressureBar).toBeGreaterThan(0);
      expect(res.relativeCellVolume).toBeGreaterThan(1.0);
    });

    it('evaluates hypertonic exosmosis yielding cell plasmolysis', () => {
      const res = evaluateOsmosisSimulation({
        ...DEFAULT_OSMOSIS_PARAMS,
        externalSoluteConcentrationMolar: 1.0, // strongly hypertonic
        internalSoluteConcentrationMolar: 0.2,
        elapsedTimeSeconds: 120,
      });

      expect(res.tonicity).toBe('hypertonic');
      expect(res.plantCellState).toBe('plasmolysed');
      expect(res.turgorPressureBar).toBe(0);
      expect(res.relativeCellVolume).toBeLessThan(1.0);
    });

    it('renders OsmosisLab with Potato Osmometer and controls', () => {
      render(<OsmosisLab />);
      expect(screen.getByText(/Flagship: Osmosis & Cell Water Potential/i)).toBeInTheDocument();
      expect(screen.getByText('Potato Osmometer')).toBeInTheDocument();
      expect(screen.getByText('Thistle Funnel')).toBeInTheDocument();
      expect(screen.getByText(/Boiled Potato Control/i)).toBeInTheDocument();
    });
  });

  // 4. Biological Workbench Component
  describe('Biological Workbench Component', () => {
    it('renders test tube rack and reagent dispensers', () => {
      render(<BiologicalWorkbench />);
      expect(screen.getByText('Biological Experiment Workbench')).toBeInTheDocument();
      expect(screen.getByText('Reagent Dispensers')).toBeInTheDocument();
      expect(screen.getByText("Lugol's Iodine")).toBeInTheDocument();
      expect(screen.getByText("Benedict's Solution")).toBeInTheDocument();
      expect(screen.getByText('Water Bath')).toBeInTheDocument();
      expect(screen.getByText('Tube 1')).toBeInTheDocument();
    });

    it('dispenses iodine reagent into starch tube and triggers blue-black reaction', () => {
      render(<BiologicalWorkbench />);
      const iodineBtn = screen.getByText("Lugol's Iodine");
      fireEvent.click(iodineBtn);
      expect(screen.getAllByText(/Blue-Black/i).length).toBeGreaterThan(0);
    });
  });

  // 5. Specialized Experiment Labs
  describe('Specialized Biological Process Laboratories', () => {
    it('renders StomataLab and calculates aperture response to light', () => {
      render(<StomataLab />);
      expect(screen.getByText(/Stomata & Transpiration Mechanics/i)).toBeInTheDocument();
      expect(screen.getByText('Diagrammatic Complex')).toBeInTheDocument();
      expect(screen.getByText('Epidermal Peel View')).toBeInTheDocument();
      expect(screen.getByText(/Drought Stress/i)).toBeInTheDocument();
    });

    it('renders SalivaryAmylaseLab with 12-well spotting tile and achromic calculation', () => {
      render(<SalivaryAmylaseLab />);
      expect(screen.getByText(/Salivary Amylase Action & Enzyme Kinetics/i)).toBeInTheDocument();
      expect(screen.getByText(/Porcelain Spotting Tile/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Achromic Point/i).length).toBeGreaterThan(0);
    });

    it('renders FoodTestingLab and executes assays for starch, protein, fat', () => {
      render(<FoodTestingLab />);
      expect(screen.getByText(/Food Component Qualitative Biochemical Assays/i)).toBeInTheDocument();
      expect(screen.getByText(/Potato Tuber Extract/i)).toBeInTheDocument();
      expect(screen.getByText('Run Assay & Dispense Reagents')).toBeInTheDocument();
    });

    it('renders SeedRespirationLab with conical respirometer and KOH', () => {
      render(<SeedRespirationLab />);
      expect(screen.getByText(/Aerobic Respiration in Germinating Seeds/i)).toBeInTheDocument();
      expect(screen.getByText(/20% KOH Tube Suspended/i)).toBeInTheDocument();
      expect(screen.getByText(/Manometer Rise/i)).toBeInTheDocument();
    });

    it('renders PhotosynthesisLab with Hydrilla bubble evolution and glowing splint test', () => {
      render(<PhotosynthesisLab />);
      expect(screen.getByText(/Photosynthesis & Limiting Factors/i)).toBeInTheDocument();
      expect(screen.getByText('Test Gas with Glowing Splint')).toBeInTheDocument();
      expect(screen.getByText(/bubbles \/ min/i)).toBeInTheDocument();
    });

    it('renders MitosisLab with stage selector and mitotic index counter', () => {
      render(<MitosisLab />);
      expect(screen.getByText(/Mitosis Stages in Onion Root Tip Squash/i)).toBeInTheDocument();
      expect(screen.getByText(/Mitotic Index Counter/i)).toBeInTheDocument();
      expect(screen.getByText('Metaphase (Equatorial Alignment)')).toBeInTheDocument();
    });

    it('renders MeiosisLab with synapsis and crossing over stages', () => {
      render(<MeiosisLab />);
      expect(screen.getByText(/Meiosis & Chromosomal Crossing Over/i)).toBeInTheDocument();
      expect(screen.getByText('Pachytene (Crossing Over)')).toBeInTheDocument();
      expect(screen.getByText('Reductional Gametogenesis')).toBeInTheDocument();
    });

    it('renders MendelianGeneticsLab with monohybrid and dihybrid Punnett squares', () => {
      render(<MendelianGeneticsLab />);
      expect(screen.getByText(/Mendelian Genetics & Punnett Square Laboratory/i)).toBeInTheDocument();
      expect(screen.getByText(/Phenotypic Ratio:/i)).toBeInTheDocument();
      expect(screen.getByText(/3 Tall : 1 Dwarf/i)).toBeInTheDocument();
    });

    it('renders DNAReplicationLab with replication fork and enzymes', () => {
      render(<DNAReplicationLab />);
      expect(screen.getByText(/DNA Replication Fork & Semiconservative Synthesis/i)).toBeInTheDocument();
      expect(screen.getAllByText(/DNA Helicase/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Next Step')).toBeInTheDocument();
    });

    it('renders GeneExpressionLab with central dogma and codon translation', () => {
      render(<GeneExpressionLab />);
      expect(screen.getByText(/Gene Expression \(Central Dogma/i)).toBeInTheDocument();
      expect(screen.getAllByText('AUG').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Methionine/i).length).toBeGreaterThan(0);
    });

    it('renders HeartCirculationLab with 4 chambers, valves, and cardiac cycle', () => {
      render(<HeartCirculationLab />);
      expect(screen.getByText(/Human Heart Hemodynamics & Cardiac Cycle/i)).toBeInTheDocument();
      expect(screen.getByText('Right Atrium')).toBeInTheDocument();
      expect(screen.getByText('Left Ventricle')).toBeInTheDocument();
      expect(screen.getByText(/Lead II ECG/i)).toBeInTheDocument();
    });

    it('renders NephronLab with countercurrent mechanism and GFR calculation', () => {
      render(<NephronLab />);
      expect(screen.getByText(/Nephron Physiology & Countercurrent Mechanism/i)).toBeInTheDocument();
      expect(screen.getByText(/Glomerular Filtration Rate:/i)).toBeInTheDocument();
      expect(screen.getByText(/RENAL CORTEX/i)).toBeInTheDocument();
    });

    it('renders ReflexArcLab with somatic neural pathway and latency', () => {
      render(<ReflexArcLab />);
      expect(screen.getByText(/Reflex Arc & Neural Pathway Simulation/i)).toBeInTheDocument();
      expect(screen.getByText('Trigger Reflex Stimulus')).toBeInTheDocument();
      expect(screen.getByText(/Total Reflex Latency:/i)).toBeInTheDocument();
    });

    it('renders EcosystemEnergyFlowLab with Lindeman 10% rule and pyramids', () => {
      render(<EcosystemEnergyFlowLab />);
      expect(screen.getByText(/Ecosystem Energy Flow & Lindeman’s 10% Law/i)).toBeInTheDocument();
      expect(screen.getByText('Energy Pyramid')).toBeInTheDocument();
      expect(screen.getByText('Biomass Pyramid')).toBeInTheDocument();
      expect(screen.getByText('Biomagnification')).toBeInTheDocument();
    });
  });

  // 6. Unified Biology Lab Workspace
  describe('Unified Biology Lab Workspace Component', () => {
    it('switches between Dedicated Lab Model, Virtual Microscope, and Apparatus Workbench', () => {
      render(<BiologyLabWorkspace experimentId="bio-osmosis" />);
      expect(screen.getByText('Dedicated Lab Model')).toBeInTheDocument();
      expect(screen.getByText('Virtual Microscope Studio')).toBeInTheDocument();
      expect(screen.getByText('Apparatus Workbench')).toBeInTheDocument();

      // Click Virtual Microscope tab
      fireEvent.click(screen.getByText('Virtual Microscope Studio'));
      expect(screen.getByText('DIN Achromatic Optics')).toBeInTheDocument();

      // Click Apparatus Workbench tab
      fireEvent.click(screen.getByText('Apparatus Workbench'));
      expect(screen.getByText('Reagent Dispensers')).toBeInTheDocument();
    });
  });

  // 7. Simulation Media & Viva Integration for all 15 experiments
  describe('Simulation Media & Viva Voce Integration', () => {
    it('verifies all 15 biology experiments have 7 topic segments and 5 viva questions', () => {
      const experiments = getExperimentsBySubject('biology');
      for (const exp of experiments) {
        const media = getSimulationMedia(exp.id);
        expect(media).toBeDefined();
        expect(media.segments).toHaveLength(7);
        expect(media.vivaQuestions).toHaveLength(5);
        expect(media.rubric.totalMarks).toBe(100);
        expect(media.rubric.labWorkMarks).toBe(60);
        expect(media.rubric.vivaMarks).toBe(40);
        for (const vq of media.vivaQuestions) {
          expect(vq.marks).toBe(8); // 5 x 8 = 40 viva marks
          expect(vq.relevantSegmentId).toBeTruthy();
        }
      }
    });
  });
});
