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
    expect(physics?.availableExperiments).toBe(25);

    expect(chemistry?.totalExperiments).toBe(27);
    expect(chemistry?.availableExperiments).toBe(11);
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

    it('should have all 25 Physics experiments marked as implemented (5 Foundation + 10 Class 11 + 10 Class 12)', () => {
      const implemented = getImplementedExperimentsBySubject('physics');
      expect(implemented).toHaveLength(25);

      const titles = implemented.map((e) => e.title);
      expect(titles).toContain("Ohm's Law");
      expect(titles).toContain('Convex Lens');
      expect(titles).toContain('Series and Parallel Circuits');
      expect(titles).toContain('Magnetic Field');
      expect(titles).toContain('Simple Pendulum');
      expect(titles).toContain('Vernier Callipers');
      expect(titles).toContain('Screw Gauge');
      expect(titles).toContain('Area of an Irregular Lamina');
      expect(titles).toContain('Spherometer');
      expect(titles).toContain('Beam Balance');
      expect(titles).toContain('Parallelogram Law of Vectors');
      expect(titles).toContain('Laws of Limiting Friction');
      expect(titles).toContain('Friction on an Inclined Plane');
      expect(titles).toContain("Hooke's Law and Spring Constant");
      expect(titles).toContain("Boyle's Law");
      expect(titles).toContain('Resistivity of a Wire Using the V-I Method');
      expect(titles).toContain('Metre Bridge – Unknown Resistance');
      expect(titles).toContain('Galvanometer Resistance and Figure of Merit');
      expect(titles).toContain('Conversion of Galvanometer into a Voltmeter');
      expect(titles).toContain('Conversion of Galvanometer into an Ammeter');
      expect(titles).toContain('Focal Length of a Concave Mirror');
      expect(titles).toContain('Focal Length of a Convex Mirror');
      expect(titles).toContain('Focal Length of a Concave Lens');
      expect(titles).toContain('Refractive Index of a Prism – Minimum Deviation');
      expect(titles).toContain('P-N Junction Diode – I-V Characteristics');

      for (const exp of implemented) {
        expect(['foundation', 'class-11', 'class-12']).toContain(exp.classLevel);
        expect(exp.implementationStatus).toBe('implemented');
      }
    });

    it('should have all 10 Class 12 Physics experiments implemented and 0 remaining under-development', () => {
      const class11 = getExperimentsByClassLevel('physics', 'class-11');
      const class12 = getExperimentsByClassLevel('physics', 'class-12');

      const class11UnderDev = class11.filter((e) => e.implementationStatus === 'under-development');
      expect(class11UnderDev).toHaveLength(0);

      const class12Implemented = class12.filter((e) => e.implementationStatus === 'implemented');
      const class12UnderDev = class12.filter((e) => e.implementationStatus === 'under-development');
      expect(class12Implemented).toHaveLength(10);
      expect(class12UnderDev).toHaveLength(0);

      const implementedTitles = class12Implemented.map((e) => e.title);
      expect(implementedTitles).toContain('Resistivity of a Wire Using the V-I Method');
      expect(implementedTitles).toContain('Metre Bridge – Unknown Resistance');
      expect(implementedTitles).toContain('Galvanometer Resistance and Figure of Merit');
      expect(implementedTitles).toContain('Conversion of Galvanometer into a Voltmeter');
      expect(implementedTitles).toContain('Conversion of Galvanometer into an Ammeter');
      expect(implementedTitles).toContain('Focal Length of a Concave Mirror');
      expect(implementedTitles).toContain('Focal Length of a Convex Mirror');
      expect(implementedTitles).toContain('Focal Length of a Concave Lens');
      expect(implementedTitles).toContain('Refractive Index of a Prism – Minimum Deviation');
      expect(implementedTitles).toContain('P-N Junction Diode – I-V Characteristics');
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

    it('should have 11 Chemistry experiments marked as implemented (5 Foundation + 6 Class 11)', () => {
      const implemented = getImplementedExperimentsBySubject('chemistry');
      expect(implemented).toHaveLength(11);

      const titles = implemented.map((e) => e.title);
      expect(titles).toContain('pH Testing');
      expect(titles).toContain('Natural Indicators');
      expect(titles).toContain('Paper Chromatography');
      expect(titles).toContain('Displacement Reaction');
      expect(titles).toContain('Crystallisation');
      expect(titles).toContain('Basic Laboratory Techniques');
      expect(titles).toContain('Melting Point Determination');
      expect(titles).toContain('Boiling Point Determination');
      expect(titles).toContain('pH Determination');
      expect(titles).toContain('Strong vs Weak Acids');

      for (const exp of implemented) {
        expect(['foundation', 'class-11']).toContain(exp.classLevel);
        expect(exp.implementationStatus).toBe('implemented');
      }
    });

    it('should have 16 Class 11 & Class 12 Chemistry experiments marked as under-development with reuse mappings where applicable', () => {
      const class11 = getExperimentsByClassLevel('chemistry', 'class-11');
      const class12 = getExperimentsByClassLevel('chemistry', 'class-12');

      const class11UnderDev = class11.filter((e) => e.implementationStatus === 'under-development');
      const class12UnderDev = class12.filter((e) => e.implementationStatus === 'under-development');

      expect(class11UnderDev).toHaveLength(5);
      expect(class12UnderDev).toHaveLength(11);

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

    expect(implemented).toHaveLength(36);
    expect(underDev).toHaveLength(16);

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

    // Implemented Class 11
    const vernier = getExperimentById('vernier-callipers');
    expect(vernier).toBeDefined();
    expect(vernier?.title).toBe('Vernier Callipers');
    expect(vernier?.subjectId).toBe('physics');
    expect(vernier?.classLevel).toBe('class-11');
    expect(vernier?.implementationStatus).toBe('implemented');

    // Implemented Class 11 (Phase 4)
    const vectorLaw = getExperimentById('parallelogram-law');
    expect(vectorLaw).toBeDefined();
    expect(vectorLaw?.title).toBe('Parallelogram Law of Vectors');
    expect(vectorLaw?.subjectId).toBe('physics');
    expect(vectorLaw?.classLevel).toBe('class-11');
    expect(vectorLaw?.implementationStatus).toBe('implemented');

    // Implemented Class 12 (Phase 6)
    const prism = getExperimentById('prism-refractive-index');
    expect(prism).toBeDefined();
    expect(prism?.title).toBe('Refractive Index of a Prism – Minimum Deviation');
    expect(prism?.subjectId).toBe('physics');
    expect(prism?.classLevel).toBe('class-12');
    expect(prism?.implementationStatus).toBe('implemented');

    // Chemistry Under-development
    const titration = getExperimentById('acid-base-titration');
    expect(titration).toBeDefined();
    expect(titration?.title).toBe('Acid-Base Titration');
    expect(titration?.subjectId).toBe('chemistry');
    expect(titration?.classLevel).toBe('class-11');
    expect(titration?.implementationStatus).toBe('under-development');
  });
});
