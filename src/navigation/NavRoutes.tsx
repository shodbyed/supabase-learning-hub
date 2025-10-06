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
import { OrganizationSettings } from '../operator/OrganizationSettings';
import { LeagueCreationWizard } from '../operator/LeagueCreationWizard';
import { LeagueRules } from '../operator/LeagueRules';
import { FiveManFormatDetails } from '../info/FiveManFormatDetails';
import { EightManFormatDetails } from '../info/EightManFormatDetails';
import { FormatComparison } from '../info/FormatComparison';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public routes - no authentication required
const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/confirm', element: <EmailConfirmation /> },
  { path: '/5-man-format-details', element: <FiveManFormatDetails /> },
  { path: '/8-man-format-details', element: <EightManFormatDetails /> },
  { path: '/format-comparison', element: <FormatComparison /> },
];

// Protected routes - require authentication only
const authRoutes = [
  { path: '/new-player', element: <NewPlayerForm /> },
  { path: '/become-league-operator', element: <BecomeLeagueOperator /> },
  { path: '/league-operator-application', element: <LeagueOperatorApplication /> },
];

// Protected routes - require authentication + approved member application
const memberRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
];

// Protected routes - require league_operator role
const operatorRoutes = [
  { path: '/operator-welcome', element: <OperatorWelcome /> },
  { path: '/operator-dashboard', element: <OperatorDashboard /> },
  { path: '/create-league', element: <LeagueCreationWizard /> },
  { path: '/operator-settings', element: <OrganizationSettings /> },
  { path: '/league-rules', element: <LeagueRules /> },
];

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Protected routes - require authentication */}
      {authRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requireAuth={true}>
              {element}
            </ProtectedRoute>
          }
        />
      ))}

      {/* Protected routes - require authentication + member record */}
      {memberRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requireAuth={true} requireApprovedApplication={true}>
              {element}
            </ProtectedRoute>
          }
        />
      ))}

      {/* League Operator Routes - Require league_operator role */}
      {operatorRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requireAuth={true} requiredRole="league_operator">
              {element}
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};
