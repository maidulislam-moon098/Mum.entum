import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/Landing.jsx';
import AuthPage from './pages/Auth.jsx';
import OnboardingFlow from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Assistant from './pages/Assistant.jsx';
import FullscreenLoader from './components/FullscreenLoader.jsx';

const ProtectedRoute = ({ children, redirectTo = '/auth' }) => {
  const { user, loading } = useAuth();

  if (loading) {
  return <FullscreenLoader message="Loading your Mum.entum" />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullscreenLoader message="Preparing your personalized journey" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const LandingRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
  return <FullscreenLoader message="Loading your Mum.entum" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <LandingRoute>
              <LandingPage />
            </LandingRoute>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingFlow />
            </OnboardingRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
