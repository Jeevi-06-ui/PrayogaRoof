import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStudentProfile,
  updateStudentProfile,
  getExperimentProgress,
  markExperimentStatus,
  createWorkspace,
  getAllWorkspaces,
  getWorkspacesByExperiment,
  deleteWorkspace,
  calculateOverallStats,
  resetAllData,
  exportStudentData,
} from '../src/services/studentProgressService';

describe('Storage & Student Progress Service', () => {
  beforeEach(async () => {
    await resetAllData();
  });

  it('should initialize and retrieve default student profile', async () => {
    const profile = await getStudentProfile();
    expect(profile).toBeDefined();
    expect(profile.name).toBe('Curious Learner');
    expect(profile.grade).toBe('Grade 10');
  });

  it('should update student profile and persist changes', async () => {
    const updated = await updateStudentProfile({
      name: 'Aarav Sharma',
      grade: 'Grade 9',
      schoolName: 'Govt Rural High School',
    });
    expect(updated.name).toBe('Aarav Sharma');
    expect(updated.grade).toBe('Grade 9');

    const fetched = await getStudentProfile();
    expect(fetched.name).toBe('Aarav Sharma');
    expect(fetched.schoolName).toBe('Govt Rural High School');
  });

  it('should initialize default progress for experiments', async () => {
    const prog = await getExperimentProgress('ohms-law');
    expect(prog).toBeDefined();
    expect(prog.experimentId).toBe('ohms-law');
    expect(prog.status).toBe('not-started');
    expect(prog.guidedCompleted).toBe(false);
  });

  it('should mark experiment as completed and update overall stats', async () => {
    await markExperimentStatus('ohms-law', 'completed');

    const prog = await getExperimentProgress('ohms-law');
    expect(prog.status).toBe('completed');
    expect(prog.guidedCompleted).toBe(true);
    expect(prog.completedAt).toBeDefined();

    const stats = await calculateOverallStats();
    expect(stats.completedExperiments).toBe(1);
    expect(stats.physicsCompleted).toBe(1);
    expect(stats.chemistryCompleted).toBe(0);
  });

  it('should create and retrieve workspaces for an experiment', async () => {
    const ws = await createWorkspace({
      experimentId: 'ohms-law',
      subjectId: 'physics',
      title: 'Circuit Trial 1',
      description: 'Testing Ohm’s law resistor',
      componentCount: 5,
      canvasState: {
        zoom: 1,
        stagePosition: { x: 0, y: 0 },
        elements: [],
      },
    });

    expect(ws.id).toBeTruthy();
    expect(ws.title).toBe('Circuit Trial 1');

    const list = await getWorkspacesByExperiment('ohms-law');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Circuit Trial 1');

    const all = await getAllWorkspaces();
    expect(all).toHaveLength(1);

    // Delete workspace
    await deleteWorkspace(ws.id, 'ohms-law');
    const remaining = await getWorkspacesByExperiment('ohms-law');
    expect(remaining).toHaveLength(0);
  });

  it('should export valid JSON student data bundle', async () => {
    await updateStudentProfile({ name: 'Priya Patel' });
    await markExperimentStatus('ph-testing', 'completed');

    const json = await exportStudentData();
    expect(json).toBeTruthy();

    const parsed = JSON.parse(json);
    expect(parsed.profile.name).toBe('Priya Patel');
    expect(parsed.progress['ph-testing'].status).toBe('completed');
  });
});
