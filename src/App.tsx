import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StudentProvider } from './context/StudentContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PhysicsPage } from './pages/PhysicsPage';
import { ChemistryPage } from './pages/ChemistryPage';
import { MathematicsPage } from './pages/MathematicsPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StudentProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Landing page wrapped inside master shell */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="subjects/physics" element={<PhysicsPage />} />
                <Route path="subjects/chemistry" element={<ChemistryPage />} />
                <Route path="subjects/biology" element={<ComingSoonPage subjectId="biology" />} />
                <Route path="subjects/mathematics" element={<MathematicsPage />} />
                <Route path="experiments/:experimentId" element={<ExperimentDetailPage />} />
                <Route path="workspace" element={<WorkspacePage />} />
                <Route path="workspace/:experimentId" element={<WorkspacePage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
                <Route path="settings" element={<Navigate to="/profile" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </StudentProvider>
    </ThemeProvider>
  );
};

export default App;
