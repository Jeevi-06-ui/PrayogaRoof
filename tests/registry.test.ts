import { describe, it, expect } from 'vitest';
import {
  getAllSubjects,
  getSubjectById,
  getExperimentsBySubject,
  getExperimentsByClassLevel,
  getImplementedExperimentsBySubject,
  getExperimentById,
  getAllActiveExperiments,
} from '../src/services/experimentRegistry';

describe('Experiment & Subject Registry (52 Curriculum Experiments Scope)', () => {
  it('should define all 4 required subjects', () => {
    const subjects = getAllSubjects();
    expect(subjects).toHaveLength(4);

    const ids = subjects.map((s) => s.id);
    expect(ids).toContain('physics');
    expect(ids).toContain('chemistry');
    expect(ids).toContain('biology');
    expect(ids).toContain('mathematics');
  });

  it('should have Physics and Chemistry active, Biology and Mathematics Coming Soon', () => {
    const physics = getSubjectById('physics');
    const chemistry = getSubjectById('chemistry');
    const biology = getSubjectById('biology');
    const math = getSubjectById('mathematics');

    expect(physics?.status).toBe('active');
    expect(chemistry?.status).toBe('active');
    expect(biology?.status).toBe('coming-soon');
    expect(math?.status).toBe('coming-soon');

    expect(physics?.totalExperiments).toBe(25);
    expect(physics?.availableExperiments).toBe(5);

    expect(chemistry?.totalExperiments).toBe(27);
    expect(chemistry?.availableExperiments).toBe(5);
  });

  describe('Physics Curriculum (25 Experiments)', () => {
    it('should list all 25 Physics experiments', () => {
      const physicsExperiments = getExperimentsBySubject('physics');
      expect(physicsExperiments).toHaveLength(25);
    });

    it('should have 5 Foundation, 10 Class 11, and 10 Class 12 Physics experiments', () => {
      const foundation = getExperimentsByClassLevel('physics', 'foundation');
      const class11 = getExperimentsByClassLevel('physics', 'class-11');
      const class12 = getExperimentsByClassLevel('physics', 'class-12');

      expect(foundation).toHaveLength(5);
      expect(class11).toHaveLength(10);
      expect(class12).toHaveLength(10);
    });

    it('should have all 5 Foundation Physics experiments marked as implemented', () => {
      const implemented = getImplementedExperimentsBySubject('physics');
      expect(implemented).toHaveLength(5);

      const titles = implemented.map((e) => e.title);
      expect(titles).toEqual([
        "Ohm's Law",
        'Convex Lens',
        'Series and Parallel Circuits',
        'Magnetic Field',
        'Simple Pendulum',
      ]);

      for (const exp of implemented) {
        expect(exp.classLevel).toBe('foundation');
        expect(exp.implementationStatus).toBe('implemented');
      }
    });

    it('should have all 20 Class 11 & Class 12 Physics experiments marked as under-development', () => {
      const class11 = getExperimentsByClassLevel('physics', 'class-11');
      const class12 = getExperimentsByClassLevel('physics', 'class-12');

      const class11Titles = class11.map((e) => e.title);
      expect(class11Titles).toContain('Vernier Callipers');
      expect(class11Titles).toContain('Screw Gauge');
      expect(class11Titles).toContain('Area of an Irregular Lamina');
      expect(class11Titles).toContain('Spherometer');
      expect(class11Titles).toContain('Beam Balance');
      expect(class11Titles).toContain('Parallelogram Law of Vectors');
      expect(class11Titles).toContain('Laws of Limiting Friction');
      expect(class11Titles).toContain('Friction on an Inclined Plane');
      expect(class11Titles).toContain("Hooke's Law and Spring Constant");
      expect(class11Titles).toContain("Boyle's Law");

      const class12Titles = class12.map((e) => e.title);
      expect(class12Titles).toContain('Resistivity of a Wire Using the V-I Method');
      expect(class12Titles).toContain('Metre Bridge – Unknown Resistance');
      expect(class12Titles).toContain('Galvanometer Resistance and Figure of Merit');
      expect(class12Titles).toContain('Conversion of Galvanometer into a Voltmeter');
      expect(class12Titles).toContain('Conversion of Galvanometer into an Ammeter');
      expect(class12Titles).toContain('Focal Length of a Concave Mirror');
      expect(class12Titles).toContain('Focal Length of a Convex Mirror');
      expect(class12Titles).toContain('Focal Length of a Concave Lens');
      expect(class12Titles).toContain('Refractive Index of a Prism – Minimum Deviation');
      expect(class12Titles).toContain('P-N Junction Diode – I-V Characteristics');

      for (const exp of [...class11, ...class12]) {
        expect(exp.implementationStatus).toBe('under-development');
      }
    });
  });

  describe('Chemistry Curriculum (27 Experiments)', () => {
    it('should list all 27 Chemistry experiments', () => {
      const chemistryExperiments = getExperimentsBySubject('chemistry');
      expect(chemistryExperiments).toHaveLength(27);
    });

    it('should have 5 Foundation, 11 Class 11, and 11 Class 12 Chemistry experiments', () => {
      const foundation = getExperimentsByClassLevel('chemistry', 'foundation');
      const class11 = getExperimentsByClassLevel('chemistry', 'class-11');
      const class12 = getExperimentsByClassLevel('chemistry', 'class-12');

      expect(foundation).toHaveLength(5);
      expect(class11).toHaveLength(11);
      expect(class12).toHaveLength(11);
    });

    it('should have all 5 Foundation Chemistry experiments marked as implemented', () => {
      const implemented = getImplementedExperimentsBySubject('chemistry');
      expect(implemented).toHaveLength(5);

      const titles = implemented.map((e) => e.title);
      expect(titles).toEqual([
        'pH Testing',
        'Natural Indicators',
        'Paper Chromatography',
        'Displacement Reaction',
        'Crystallisation',
      ]);

      for (const exp of implemented) {
        expect(exp.classLevel).toBe('foundation');
        expect(exp.implementationStatus).toBe('implemented');
      }
    });

    it('should have 22 Class 11 & Class 12 Chemistry experiments marked as under-development with reuse mappings where applicable', () => {
      const class11 = getExperimentsByClassLevel('chemistry', 'class-11');
      const class12 = getExperimentsByClassLevel('chemistry', 'class-12');

      for (const exp of [...class11, ...class12]) {
        expect(exp.implementationStatus).toBe('under-development');
      }

      // Check reuse mapping
      const crystallisationC11 = getExperimentById('crystallisation-class11');
      expect(crystallisationC11?.reusedModuleId).toBe('crystallisation');

      const phDet = getExperimentById('ph-determination');
      expect(phDet?.reusedModuleId).toBe('ph-testing');

      const chromC12 = getExperimentById('paper-chromatography-class12');
      expect(chromC12?.reusedModuleId).toBe('paper-chromatography');
    });
  });

  it('should have complete metadata for every curriculum experiment (52 total)', () => {
    const all = getAllActiveExperiments();
    expect(all).toHaveLength(52);

    const implemented = all.filter((e) => e.implementationStatus === 'implemented');
    const underDev = all.filter((e) => e.implementationStatus === 'under-development');

    expect(implemented).toHaveLength(10);
    expect(underDev).toHaveLength(42);

    for (const exp of all) {
      expect(exp.id).toBeTruthy();
      expect(exp.title).toBeTruthy();
      expect(exp.shortDescription).toBeTruthy();
      expect(exp.fullDescription).toBeTruthy();
      expect(exp.classLevel).toBeDefined();
      expect(['foundation', 'class-11', 'class-12']).toContain(exp.classLevel);
      expect(['implemented', 'under-development']).toContain(exp.implementationStatus);
      expect(exp.learningObjectives.length).toBeGreaterThan(0);
      expect(exp.apparatus.length).toBeGreaterThan(0);
      expect(exp.safetyGuidelines.length).toBeGreaterThan(0);
      expect(exp.curriculumTags.length).toBeGreaterThan(0);
      expect(exp.estimatedDurationMinutes).toBeGreaterThan(0);
    }
  });

  it('should retrieve individual experiments by ID', () => {
    // Implemented Foundation
    const ohmsLaw = getExperimentById('ohms-law');
    expect(ohmsLaw).toBeDefined();
    expect(ohmsLaw?.title).toBe("Ohm's Law");
    expect(ohmsLaw?.subjectId).toBe('physics');
    expect(ohmsLaw?.implementationStatus).toBe('implemented');

    // Under-development Class 11
    const vernier = getExperimentById('vernier-callipers');
    expect(vernier).toBeDefined();
    expect(vernier?.title).toBe('Vernier Callipers');
    expect(vernier?.subjectId).toBe('physics');
    expect(vernier?.classLevel).toBe('class-11');
    expect(vernier?.implementationStatus).toBe('under-development');

    // Under-development Class 12
    const prism = getExperimentById('prism-refractive-index');
    expect(prism).toBeDefined();
    expect(prism?.title).toBe('Refractive Index of a Prism – Minimum Deviation');
    expect(prism?.subjectId).toBe('physics');
    expect(prism?.classLevel).toBe('class-12');
    expect(prism?.implementationStatus).toBe('under-development');

    // Chemistry Under-development
    const titration = getExperimentById('acid-base-titration');
    expect(titration).toBeDefined();
    expect(titration?.title).toBe('Acid-Base Titration');
    expect(titration?.subjectId).toBe('chemistry');
    expect(titration?.classLevel).toBe('class-11');
    expect(titration?.implementationStatus).toBe('under-development');
  });
});
