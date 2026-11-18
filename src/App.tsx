import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { PhysicsPage } from './pages/PhysicsPage';
import { ChemistryPage } from './pages/ChemistryPage';
import { MathematicsPage } from './pages/MathematicsPage';
import { BiologyPage } from './pages/BiologyPage';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

const SubjectsRouteDispatcher: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  switch (subjectId) {
    case 'physics':
      return <PhysicsPage />;
    case 'chemistry':
      return <ChemistryPage />;
    case 'biology':
      return <BiologyPage />;
    case 'mathematics':
      return <MathematicsPage />;
    default:
      return <SubjectsPage />;
  }
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Master shell */}
                <Route path="/" element={<AppLayout />}>
                  {/* Default Homepage is now the Firebase Login Page */}
                  <Route index element={<LoginPage />} />
                  <Route path="welcome" element={<LandingPage />} />
                  <Route path="auth" element={<Navigate to="/" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="teacher"
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                        <TeacherDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="subjects" element={<SubjectsPage />} />
                  <Route path="subjects/physics" element={<PhysicsPage />} />
                  <Route path="subjects/chemistry" element={<ChemistryPage />} />
                  <Route path="subjects/biology" element={<BiologyPage />} />
                  <Route path="subjects/mathematics" element={<MathematicsPage />} />
                  <Route path="subjects/:subjectId" element={<SubjectsRouteDispatcher />} />
                  <Route path="experiments/:experimentId" element={<ExperimentDetailPage />} />
                  <Route path="workspace" element={<WorkspacePage />} />
                  <Route path="workspace/:experimentId" element={<WorkspacePage />} />
                  <Route path="bench" element={<Navigate to="/workspace" replace />} />
                  <Route path="progress" element={<Navigate to="/profile" replace />} />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="settings" element={<Navigate to="/profile" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </StudentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
