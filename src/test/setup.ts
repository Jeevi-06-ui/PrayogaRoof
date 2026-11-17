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
function filterKonvaProps(props: Record<string, any>) {
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

vi.mock('react-konva', () => {
  return {
    Stage: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'konva-stage', ...filterKonvaProps(props) }, children),
    Layer: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'konva-layer', ...filterKonvaProps(props) }, children),
    Rect: (props: any) =>
      React.createElement('div', { 'data-testid': 'konva-rect', ...filterKonvaProps(props) }),
    Circle: (props: any) =>
      React.createElement('div', { 'data-testid': 'konva-circle', ...filterKonvaProps(props) }),
    Line: (props: any) =>
      React.createElement('div', { 'data-testid': 'konva-line', ...filterKonvaProps(props) }),
    Text: (props: any) =>
      React.createElement('div', { 'data-testid': 'konva-text', ...filterKonvaProps(props) }, props.text),
    Group: ({ children, ...props }: any) =>
      React.createElement('div', { 'data-testid': 'konva-group', ...filterKonvaProps(props) }, children),
  };
});

// Mock Web Speech API SpeechSynthesis for JSDOM
class MockSpeechSynthesisUtterance {
  text: string = '';
  lang: string = 'en-US';
  voice: any = null;
  volume: number = 1;
  rate: number = 1;
  pitch: number = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;
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

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});
