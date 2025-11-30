import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { Login } from '../login/Login';
import { Register } from '../login/Register';
import { ForgotPassword } from '../login/ForgotPassword';
import { ResetPassword } from '../login/ResetPassword';
import { EmailConfirmation } from '../login/EmailConfirmation';
import { About } from '../about/About';
import { Pricing } from '../about/Pricing';
import { NewPlayerForm } from '../newPlayer/NewPlayerForm';
import { Dashboard } from '../dashboard/Dashboard';
import { Profile } from '../profile/Profile';
import { MyTeams } from '../player/MyTeams';
import { TeamSchedule } from '../player/TeamSchedule';
import { MatchLineup } from '../player/MatchLineup';
import { ScoreMatch } from '../player/ScoreMatch';
import { BecomeLeagueOperator } from '../leagueOperator/BecomeLeagueOperator';
import { LeagueOperatorApplication } from '../leagueOperator/LeagueOperatorApplication';
import { Messages } from '../pages/Messages';
import { PlayerProfile } from '../pages/PlayerProfile';
import { AdminReports } from '../pages/AdminReports';
import { MatchDataViewer } from '../pages/MatchDataViewer';
import { Standings } from '../pages/Standings';
import { TopShooters } from '../pages/TopShooters';
import { TeamStats } from '../pages/TeamStats';
import { FeatsOfExcellence } from '../pages/FeatsOfExcellence';
import { FiveManFormatDetails } from '../info/FiveManFormatDetails';
import { EightManFormatDetails } from '../info/EightManFormatDetails';
import { FormatComparison } from '../info/FormatComparison';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoadingSpinner } from '../components/LoadingSpinner';
import HandicapLookupTest from '../pages/HandicapLookupTest';
import { DevOnly } from '../dev/DevOnly';
import RLSTestPage from '../dev/RLSTestPage';

// Lazy-loaded operator pages (only loaded when operator accesses them)
const OperatorWelcome = lazy(() => import('../operator/OperatorWelcome'));
const OperatorDashboard = lazy(() => import('../operator/OperatorDashboard'));
const OrganizationSettings = lazy(() => import('../operator/OrganizationSettings'));
const ReportsManagement = lazy(() => import('../operator/ReportsManagement'));
const PlayerManagement = lazy(() => import('../operator/PlayerManagement'));
const LeagueCreationWizard = lazy(() => import('../operator/LeagueCreationWizard'));
const LeagueRules = lazy(() => import('../operator/LeagueRules'));
const LeagueDetail = lazy(() => import('../operator/LeagueDetail'));
const SeasonCreationWizard = lazy(() => import('../operator/SeasonCreationWizard'));
const SeasonScheduleManager = lazy(() => import('../operator/SeasonScheduleManager'));
const VenueManagement = lazy(() => import('../operator/VenueManagement'));
const TeamManagement = lazy(() => import('../operator/TeamManagement'));
const ScheduleSetupPage = lazy(() => import('../operator/ScheduleSetupPage'));
const SeasonSchedulePage = lazy(() => import('../operator/SeasonSchedulePage'));

// Public routes - no authentication required
const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/confirm', element: <EmailConfirmation /> },
  { path: '/5-man-format-details', element: <FiveManFormatDetails /> },
  { path: '/8-man-format-details', element: <EightManFormatDetails /> },
  { path: '/format-comparison', element: <FormatComparison /> },
  { path: '/test/handicap-lookup', element: <HandicapLookupTest /> },
];

// Development-only routes - only accessible when running in dev mode
const devRoutes = [
  { path: '/dev/rls-tests', element: <DevOnly><RLSTestPage /></DevOnly> },
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
  { path: '/messages', element: <Messages /> },
  { path: '/player/:playerId', element: <PlayerProfile /> },
  { path: '/my-teams', element: <MyTeams /> },
  { path: '/team/:teamId/schedule', element: <TeamSchedule /> },
  { path: '/match/:matchId/lineup', element: <MatchLineup /> },
  { path: '/match/:matchId/score', element: <ScoreMatch /> },
  // Stats & Standings pages (accessible to all members)
  { path: '/league/:leagueId/season/:seasonId/standings', element: <Standings /> },
  { path: '/league/:leagueId/season/:seasonId/top-shooters', element: <TopShooters /> },
  { path: '/league/:leagueId/season/:seasonId/team-stats', element: <TeamStats /> },
  { path: '/league/:leagueId/season/:seasonId/feats', element: <FeatsOfExcellence /> },
  { path: '/league/:leagueId/season/:seasonId/match-data', element: <MatchDataViewer /> },
];

// Protected routes - require league_operator role
const operatorRoutes = [
  { path: '/operator-welcome', element: <OperatorWelcome /> },
  { path: '/operator-dashboard/:orgId', element: <OperatorDashboard /> },
  { path: '/operator-reports', element: <ReportsManagement /> },
  { path: '/manage-players/:orgId', element: <PlayerManagement /> },
  { path: '/create-league/:orgId', element: <LeagueCreationWizard /> },
  { path: '/operator-settings/:orgId', element: <OrganizationSettings /> },
  { path: '/league-rules/:orgId', element: <LeagueRules /> },
  { path: '/league/:leagueId', element: <LeagueDetail /> },
  { path: '/league/:leagueId/create-season', element: <SeasonCreationWizard /> },
  { path: '/league/:leagueId/season/:seasonId/manage-schedule', element: <SeasonScheduleManager /> },
  { path: '/league/:leagueId/manage-teams', element: <TeamManagement /> },
  { path: '/league/:leagueId/season/:seasonId/schedule-setup', element: <ScheduleSetupPage /> },
  { path: '/league/:leagueId/season/:seasonId/schedule', element: <SeasonSchedulePage /> },
  { path: '/venues/:orgId', element: <VenueManagement /> },
];

// Protected routes - require developer role
const developerRoutes = [
  { path: '/admin-reports', element: <AdminReports /> },
];

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Development-only routes - only accessible in dev mode */}
      {devRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

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
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute requireAuth={true} requiredRole="league_operator">
                {element}
              </ProtectedRoute>
            </Suspense>
          }
        />
      ))}

      {/* Developer Routes - Require developer role */}
      {developerRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requireAuth={true} requiredRole="developer">
              {element}
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  );
};
