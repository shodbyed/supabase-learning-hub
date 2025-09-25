import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { Login } from '../login/Login';
import { Register } from '../login/Register';
import { ForgotPassword } from '../login/ForgotPassword';
import { ResetPassword } from '../login/ResetPassword';
import { EmailConfirmation } from '../login/EmailConfirmation';
import { About } from '../about/About';
import { NewPlayerForm } from '../newPlayer/NewPlayerForm';
import { Dashboard } from '../dashboard/Dashboard';
import { Profile } from '../profile/Profile';
import { BecomeLeagueOperator } from '../leagueOperator/BecomeLeagueOperator';
import { LeagueOperatorApplication } from '../leagueOperator/LeagueOperatorApplication';
import { OperatorWelcome } from '../operator/OperatorWelcome';
import { OperatorDashboard } from '../operator/OperatorDashboard';
import { LeagueCreationWizard } from '../operator/LeagueCreationWizard';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm" element={<EmailConfirmation />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/new-player"
        element={
          <ProtectedRoute requireAuth={true}>
            <NewPlayerForm />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - require authentication + member record */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAuth={true} requireApprovedApplication={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute requireAuth={true} requireApprovedApplication={true}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/become-league-operator"
        element={
          <ProtectedRoute requireAuth={true}>
            <BecomeLeagueOperator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/league-operator-application"
        element={
          <ProtectedRoute requireAuth={true}>
            <LeagueOperatorApplication />
          </ProtectedRoute>
        }
      />

      {/* League Operator Routes - Require league_operator role */}
      <Route
        path="/operator-welcome"
        element={
          <ProtectedRoute requireAuth={true} requiredRole="league_operator">
            <OperatorWelcome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator-dashboard"
        element={
          <ProtectedRoute requireAuth={true} requiredRole="league_operator">
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-league"
        element={
          <ProtectedRoute requireAuth={true} requiredRole="league_operator">
            <LeagueCreationWizard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
