import React from 'react';
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// Mock window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock react-konva for jsdom test runner with safe DOM prop filtering
function filterKonvaProps(props: Record<string, unknown>) {
  const {
    cornerRadius: _cornerRadius,
    shadowColor: _shadowColor,
    shadowBlur: _shadowBlur,
    shadowOpacity: _shadowOpacity,
    shadowOffsetX: _shadowOffsetX,
    shadowOffsetY: _shadowOffsetY,
    scaleX: _scaleX,
    scaleY: _scaleY,
    dash: _dash,
    tension: _tension,
    lineCap: _lineCap,
    lineJoin: _lineJoin,
    onTap: _onTap,
    ...rest
  } = props;
  return rest;
}

interface KonvaMockProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

vi.mock('react-konva', () => {
  return {
    Stage: ({ children, ...props }: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-stage', ...filterKonvaProps(props) }, children),
    Layer: ({ children, ...props }: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-layer', ...filterKonvaProps(props) }, children),
    Rect: (props: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-rect', ...filterKonvaProps(props) }),
    Circle: (props: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-circle', ...filterKonvaProps(props) }),
    Line: (props: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-line', ...filterKonvaProps(props) }),
    Text: (props: KonvaMockProps & { text?: string }) =>
      React.createElement('div', { 'data-testid': 'konva-text', ...filterKonvaProps(props) }, props.text as React.ReactNode),
    Group: ({ children, ...props }: KonvaMockProps) =>
      React.createElement('div', { 'data-testid': 'konva-group', ...filterKonvaProps(props) }, children),
  };
});

// Mock Web Speech API SpeechSynthesis for JSDOM
class MockSpeechSynthesisUtterance {
  text: string = '';
  lang: string = 'en-US';
  voice: SpeechSynthesisVoice | null = null;
  volume: number = 1;
  rate: number = 1;
  pitch: number = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: SpeechSynthesisErrorEvent | { error: string }) => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;
  constructor(text: string = '') {
    this.text = text;
  }
}

const mockVoices = [
  { name: 'Google US English', lang: 'en-US', default: true, localService: true, voiceURI: 'google-us' },
  { name: 'Samantha', lang: 'en-US', default: false, localService: true, voiceURI: 'samantha' },
  { name: 'Daniel', lang: 'en-GB', default: false, localService: true, voiceURI: 'daniel' },
];

const mockSpeechSynthesis = {
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null as (() => void) | null,
  getVoices: () => mockVoices,
  speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
    mockSpeechSynthesis.speaking = true;
    mockSpeechSynthesis.paused = false;
    utterance.onstart?.();
  }),
  cancel: vi.fn(() => {
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.paused = false;
  }),
  pause: vi.fn(() => {
    mockSpeechSynthesis.paused = true;
  }),
  resume: vi.fn(() => {
    mockSpeechSynthesis.paused = false;
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock Firebase Firestore in-memory for testing
const MOCK_FIRESTORE = new Map<string, Record<string, unknown>>();

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    initializeFirestore: vi.fn(() => ({})),
    persistentLocalCache: vi.fn(() => ({})),
    persistentMultipleTabManager: vi.fn(() => ({})),
    deleteDoc: vi.fn(async (docRef: { path: string }) => {
      MOCK_FIRESTORE.delete(docRef.path);
    }),
    doc: vi.fn((_db: unknown, ...paths: string[]) => ({
      path: paths.filter(Boolean).join('/').replace(/\/+/g, '/'),
      id: paths[paths.length - 1],
    })),
    collection: vi.fn((_db: unknown, ...paths: string[]) => ({
      path: paths.filter(Boolean).join('/').replace(/\/+/g, '/'),
    })),
    getDoc: vi.fn(async (docRef: { path: string }) => {
      const exists = MOCK_FIRESTORE.has(docRef.path);
      return {
        exists: () => exists,
        data: () => (exists ? JSON.parse(JSON.stringify(MOCK_FIRESTORE.get(docRef.path))) : undefined),
        id: docRef.path.split('/').pop() || '',
      };
    }),
    setDoc: vi.fn(async (docRef: { path: string }, data: Record<string, unknown>, options?: { merge?: boolean }) => {
      if (options?.merge && MOCK_FIRESTORE.has(docRef.path)) {
        MOCK_FIRESTORE.set(docRef.path, { ...MOCK_FIRESTORE.get(docRef.path), ...data });
      } else {
        MOCK_FIRESTORE.set(docRef.path, { ...data });
      }
    }),
    updateDoc: vi.fn(async (docRef: { path: string }, data: Record<string, unknown>) => {
      const existing = MOCK_FIRESTORE.get(docRef.path) || {};
      MOCK_FIRESTORE.set(docRef.path, { ...existing, ...data });
    }),
    getDocs: vi.fn(async (colRef: { path: string }) => {
      const docs: Array<{ id: string; data: () => Record<string, unknown> }> = [];
      const prefix = colRef.path.endsWith('/') ? colRef.path : `${colRef.path}/`;
      MOCK_FIRESTORE.forEach((val, key) => {
        if (key.startsWith(prefix) && key.replace(prefix, '').indexOf('/') === -1) {
          docs.push({
            id: key.replace(prefix, ''),
            data: () => JSON.parse(JSON.stringify(val)),
          });
        }
      });
      return { docs };
    }),
    writeBatch: vi.fn(() => {
      const ops: Array<() => void> = [];
      return {
        set: vi.fn((docRef: { path: string }, data: Record<string, unknown>, options?: { merge?: boolean }) => {
          ops.push(() => {
            if (options?.merge && MOCK_FIRESTORE.has(docRef.path)) {
              MOCK_FIRESTORE.set(docRef.path, { ...MOCK_FIRESTORE.get(docRef.path), ...data });
            } else {
              MOCK_FIRESTORE.set(docRef.path, { ...data });
            }
          });
        }),
        update: vi.fn((docRef: { path: string }, data: Record<string, unknown>) => {
          ops.push(() => {
            const existing = MOCK_FIRESTORE.get(docRef.path) || {};
            MOCK_FIRESTORE.set(docRef.path, { ...existing, ...data });
          });
        }),
        delete: vi.fn((docRef: { path: string }) => {
          ops.push(() => {
            MOCK_FIRESTORE.delete(docRef.path);
          });
        }),
        commit: vi.fn(async () => {
          ops.forEach((op) => op());
        }),
      };
    }),
  };
});

// Mock Firebase Auth in-memory for testing
vi.mock('firebase/auth', () => {
  let mockCurrentUser: unknown = null;
  return {
    getAuth: vi.fn(() => ({
      get currentUser() {
        return mockCurrentUser;
      },
    })),
    createUserWithEmailAndPassword: vi.fn(async (_auth: unknown, email: string) => {
      mockCurrentUser = {
        uid: `user-${Date.now()}`,
        email,
        displayName: 'Test Student',
      };
      return { user: mockCurrentUser };
    }),
    signInWithEmailAndPassword: vi.fn(async (_auth: unknown, email: string) => {
      mockCurrentUser = {
        uid: 'student-firebase-uid-aaa-101',
        email,
        displayName: 'Ananya Sharma',
      };
      return { user: mockCurrentUser };
    }),
    signOut: vi.fn(async () => {
      mockCurrentUser = null;
    }),
    sendPasswordResetEmail: vi.fn(async () => {}),
    sendEmailVerification: vi.fn(async () => {}),
    updateProfile: vi.fn(async (user: { displayName?: string }, updates: { displayName?: string }) => {
      if (user && updates.displayName) {
        user.displayName = updates.displayName;
      }
    }),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: unknown) => void) => {
      callback(mockCurrentUser);
      return () => {};
    }),
    setPersistence: vi.fn(async () => {}),
    browserLocalPersistence: {},
  };
});
