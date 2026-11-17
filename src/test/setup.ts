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

// Mock react-konva for jsdom test runner
vi.mock('react-konva', () => {
  return {
    Stage: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'konva-stage', ...props }, children),
    Layer: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'konva-layer', ...props }, children),
    Rect: (props: any) => React.createElement('div', { 'data-testid': 'konva-rect', ...props }),
    Circle: (props: any) => React.createElement('div', { 'data-testid': 'konva-circle', ...props }),
    Line: (props: any) => React.createElement('div', { 'data-testid': 'konva-line', ...props }),
    Text: (props: any) => React.createElement('div', { 'data-testid': 'konva-text', ...props }, props.text),
    Group: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'konva-group', ...props }, children),
  };
});
