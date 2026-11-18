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

  it('should have Physics, Chemistry, Mathematics, and Biology active', () => {
    const physics = getSubjectById('physics');
    const chemistry = getSubjectById('chemistry');
    const biology = getSubjectById('biology');
    const math = getSubjectById('mathematics');

    expect(physics?.status).toBe('active');
    expect(chemistry?.status).toBe('active');
    expect(biology?.status).toBe('active');
    expect(math?.status).toBe('active');

    expect(physics?.totalExperiments).toBe(25);
    expect(physics?.availableExperiments).toBe(25);

    expect(chemistry?.totalExperiments).toBe(27);
    expect(chemistry?.availableExperiments).toBe(27);

    expect(biology?.totalExperiments).toBe(15);
    expect(biology?.availableExperiments).toBe(15);

    expect(math?.totalExperiments).toBe(12);
    expect(math?.availableExperiments).toBe(12);
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

    it('should have all 27 Chemistry experiments marked as implemented (5 Foundation + 11 Class 11 + 11 Class 12)', () => {
      const implemented = getImplementedExperimentsBySubject('chemistry');
      expect(implemented).toHaveLength(27);

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
      expect(titles).toContain('Chemical Equilibrium');
      expect(titles).toContain('Standard Solution Preparation');
      expect(titles).toContain('Acid-Base Titration');
      expect(titles).toContain('Salt Analysis');
      expect(titles).toContain('Organic Element Detection');
      expect(titles).toContain('Surface Chemistry');
      expect(titles).toContain('Chemical Kinetics');
      expect(titles).toContain('Thermochemistry');
      expect(titles).toContain('Electrochemistry');
      expect(titles).toContain('Inorganic Compound Preparation');
      expect(titles).toContain('Organic Compound Preparation');
      expect(titles).toContain('Functional Group Identification');
      expect(titles).toContain('Food Component Testing');
      expect(titles).toContain('Redox Titration – Potassium Permanganate');

      for (const exp of implemented) {
        expect(['foundation', 'class-11', 'class-12']).toContain(exp.classLevel);
        expect(exp.implementationStatus).toBe('implemented');
      }
    });

    it('should have all 11 Class 12 Chemistry experiments implemented and 0 remaining under-development', () => {
      const class11 = getExperimentsByClassLevel('chemistry', 'class-11');
      const class12 = getExperimentsByClassLevel('chemistry', 'class-12');

      const class11UnderDev = class11.filter((e) => e.implementationStatus === 'under-development');
      const class12Implemented = class12.filter((e) => e.implementationStatus === 'implemented');
      const class12UnderDev = class12.filter((e) => e.implementationStatus === 'under-development');

      expect(class11UnderDev).toHaveLength(0);
      expect(class12Implemented).toHaveLength(11);
      expect(class12UnderDev).toHaveLength(0);

      const implementedTitles = class12Implemented.map((e) => e.title);
      expect(implementedTitles).toContain('Surface Chemistry');
      expect(implementedTitles).toContain('Chemical Kinetics');
      expect(implementedTitles).toContain('Thermochemistry');
      expect(implementedTitles).toContain('Electrochemistry');
      expect(implementedTitles).toContain('Paper Chromatography');
      expect(implementedTitles).toContain('Inorganic Compound Preparation');
      expect(implementedTitles).toContain('Organic Compound Preparation');
      expect(implementedTitles).toContain('Functional Group Identification');
      expect(implementedTitles).toContain('Food Component Testing');
      expect(implementedTitles).toContain('Redox Titration – Potassium Permanganate');
      expect(implementedTitles).toContain('Salt Analysis');

      // Check reuse mapping
      const crystallisationC11 = getExperimentById('crystallisation-class11');
      expect(crystallisationC11?.reusedModuleId).toBe('crystallisation');

      const phDet = getExperimentById('ph-determination');
      expect(phDet?.reusedModuleId).toBe('ph-testing');

      const chromC12 = getExperimentById('paper-chromatography-class12');
      expect(chromC12?.reusedModuleId).toBe('paper-chromatography');
      expect(chromC12?.implementationStatus).toBe('implemented');
    });
  });

  describe('Biology Curriculum (15 Experiments)', () => {
    it('should have 15 biology experiments', () => {
      const bio = getExperimentsBySubject('biology');
      expect(bio).toHaveLength(15);
    });

    it('should cover Class 10 Foundation (5), Class 11 (6), and Class 12 (4)', () => {
      const c10 = getExperimentsByClassLevel('biology', 'foundation');
      const c11 = getExperimentsByClassLevel('biology', 'class-11');
      const c12 = getExperimentsByClassLevel('biology', 'class-12');

      expect(c10).toHaveLength(5);
      expect(c11).toHaveLength(6);
      expect(c12).toHaveLength(4);
    });
  });

  it('should have complete metadata for every curriculum experiment (67 total, 67 implemented)', () => {
    const all = getAllActiveExperiments();
    expect(all).toHaveLength(67);

    const implemented = all.filter((e) => e.implementationStatus === 'implemented');
    const underDev = all.filter((e) => e.implementationStatus === 'under-development');

    expect(implemented).toHaveLength(67);
    expect(underDev).toHaveLength(0);

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

    // Implemented Class 11 Chemistry (Phase 8)
    const titration = getExperimentById('acid-base-titration');
    expect(titration).toBeDefined();
    expect(titration?.title).toBe('Acid-Base Titration');
    expect(titration?.subjectId).toBe('chemistry');
    expect(titration?.classLevel).toBe('class-11');
    expect(titration?.implementationStatus).toBe('implemented');

    // Implemented Class 12 Chemistry (Phase 9)
    const kineticsExp = getExperimentById('chemical-kinetics');
    expect(kineticsExp).toBeDefined();
    expect(kineticsExp?.title).toBe('Chemical Kinetics');
    expect(kineticsExp?.subjectId).toBe('chemistry');
    expect(kineticsExp?.classLevel).toBe('class-12');
    expect(kineticsExp?.implementationStatus).toBe('implemented');

    // Chemistry Class 12 Implemented (Phase 10)
    const inorgPrep = getExperimentById('inorganic-compound-prep');
    expect(inorgPrep).toBeDefined();
    expect(inorgPrep?.title).toBe('Inorganic Compound Preparation');
    expect(inorgPrep?.subjectId).toBe('chemistry');
    expect(inorgPrep?.classLevel).toBe('class-12');
    expect(inorgPrep?.implementationStatus).toBe('implemented');
  });
});
