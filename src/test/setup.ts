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
    cornerRadius,
    shadowColor,
    shadowBlur,
    shadowOpacity,
    shadowOffsetX,
    shadowOffsetY,
    scaleX,
    scaleY,
    dash,
    tension,
    lineCap,
    lineJoin,
    onTap,
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
