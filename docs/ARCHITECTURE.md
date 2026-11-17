# PrayogaProof Architecture Documentation

## 1. System Vision & Overview

**PrayogaProof** is an interactive, free-form virtual STEM laboratory engineered for web, Android, and iOS platforms. It allows students, especially in underserved and rural schools, to explore scientific phenomena through hands-on virtual experimentation styled after professional network simulators like Cisco Packet Tracer.

---

## 2. Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|                                  React 18 Shell                                   |
|   +-----------------------+-----------------------------+---------------------+   |
|   |   Navigation Bar      |   Route Shell (App.tsx)     |   Theme & Student   |   |
|   |   & Mobile Drawer     |   Lazy-loaded Routes        |   Context Providers |   |
|   +-----------------------+-----------------------------+---------------------+   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           UniversalLabWorkspace Component                         |
|   +-------------------+  +--------------------------------+  +----------------+   |
|   | ToolCatalogue     |  | Interactive Konva Canvas       |  | ObjectInspector|   |
|   | Panel (Search,    |  | (Zoom, Pan, Drag-and-Drop,     |  | - Properties   |   |
|   | Category Filters) |  |  Touch Gestures, Wire Drawing) |  | - Guide Steps  |   |
|   |                   |  |                                |  | - Reagents/Quiz|   |
|   |                   |  |                                |  | - Lab Notebook |   |
|   +-------------------+  +--------------------------------+  +----------------+   |
+-----------------------------------------------------------------------------------+
         |                                |                               |
         v                                v                               v
+------------------+             +------------------+            +------------------+
| History Manager  |             | Scientific Engine|            | Persistence      |
| (Undo/Redo Stack |             | - Circuit MNA    |            | Subsystem        |
|  Command Pattern)|             | - Ray Tracing    |            | - IndexedDB(idb) |
|                  |             | - Pendulum ODE   |            | - LocalStorage   |
|                  |             | - Chemical Model |            | - PWA Service Wk |
+------------------+             +------------------+            +------------------+
```

---

## 3. Core Subsystems

### 3.1 Universal Three-Panel Virtual Workspace
- **Left Panel (Tool Catalogue):** Provides searchable equipment categorized by subject, type, or experiment scope. Supports both mouse HTML5 drag-and-drop and tap-to-add for touch screens.
- **Center Canvas (React Konva):** Fast 2D hardware-accelerated canvas. Implements pan, zoom (25% to 300%), snap-to-grid, multi-touch pinch, terminal snap-connect, and object rotation.
- **Right Panel (Inspector & Companion):** Houses contextual property editors, interactive multi-step guided procedures, curriculum safety notes, self-assessment quizzes, and the student's experiment notebook.

### 3.2 Domain Solver Isolation Principle
A fundamental architectural invariant: **Scientific simulation logic must never be embedded inside UI or Konva rendering components.**
- Solvers are isolated in pure TypeScript modules (`src/services/circuit/`, `src/services/physics/`, `src/services/chemistry/`).
- Solvers accept immutable state representations (`WorkspaceObject[]`, `WorkspaceConnection[]`, parameters) and return deterministic `SimulationResult` records.
- Enables thorough headless unit testing (100% testable in Vitest without DOM or canvas overhead).

### 3.3 State Management & History Stack
- `WorkspaceHistoryManager`: Maintains an undo/redo stack up to 30 states.
- Actions create deep snapshot clones using structured serialization.
- Full support for Ctrl+Z, Ctrl+Y, undo button, and redo button.

### 3.4 Storage & Offline-First Foundation
- **IndexedDB (`idb`):** Stores student profiles, active experiment progress, quiz scores, and arbitrary saved workspace snapshots with element coordinates and connections.
- **Service Worker (`public/sw.js`):** Intercepts network calls, pre-caches the application shell, serves static assets from cache with stale-while-revalidate, and falls back to `/index.html` for offline SPA navigation.

### 3.5 Cross-Platform Mobile Packaging
- **Capacitor v6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`):** Wraps the production Vite single-page application into native Android APK/AAB and iOS Xcode project structures without modifying core web application code.
