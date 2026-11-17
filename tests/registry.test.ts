import { describe, it, expect } from 'vitest';
import {
  getAllSubjects,
  getSubjectById,
  getExperimentsBySubject,
  getExperimentById,
  getAllActiveExperiments,
} from '../src/services/experimentRegistry';

describe('Experiment & Subject Registry', () => {
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
  });

  it('should list exactly the 5 required Physics experiments', () => {
    const physicsExperiments = getExperimentsBySubject('physics');
    expect(physicsExperiments).toHaveLength(5);

    const titles = physicsExperiments.map((e) => e.title);
    expect(titles).toContain("Ohm's Law");
    expect(titles).toContain('Convex Lens');
    expect(titles).toContain('Series and Parallel Circuits');
    expect(titles).toContain('Magnetic Field');
    expect(titles).toContain('Simple Pendulum');
  });

  it('should list exactly the 5 required Chemistry experiments', () => {
    const chemistryExperiments = getExperimentsBySubject('chemistry');
    expect(chemistryExperiments).toHaveLength(5);

    const titles = chemistryExperiments.map((e) => e.title);
    expect(titles).toContain('pH Testing');
    expect(titles).toContain('Natural Indicators');
    expect(titles).toContain('Paper Chromatography');
    expect(titles).toContain('Displacement Reaction');
    expect(titles).toContain('Crystallisation');
  });

  it('should have complete metadata for every active experiment', () => {
    const all = getAllActiveExperiments();
    expect(all).toHaveLength(10);

    for (const exp of all) {
      expect(exp.id).toBeTruthy();
      expect(exp.title).toBeTruthy();
      expect(exp.shortDescription).toBeTruthy();
      expect(exp.fullDescription).toBeTruthy();
      expect(exp.learningObjectives.length).toBeGreaterThan(0);
      expect(exp.apparatus.length).toBeGreaterThan(0);
      expect(exp.safetyGuidelines.length).toBeGreaterThan(0);
      expect(exp.curriculumTags.length).toBeGreaterThan(0);
      expect(exp.estimatedDurationMinutes).toBeGreaterThan(0);
    }
  });

  it('should retrieve individual experiment by ID', () => {
    const ohmsLaw = getExperimentById('ohms-law');
    expect(ohmsLaw).toBeDefined();
    expect(ohmsLaw?.title).toBe("Ohm's Law");
    expect(ohmsLaw?.subjectId).toBe('physics');

    const phTesting = getExperimentById('ph-testing');
    expect(phTesting).toBeDefined();
    expect(phTesting?.title).toBe('pH Testing');
    expect(phTesting?.subjectId).toBe('chemistry');
  });
});
