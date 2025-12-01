// Navigation
import { BrowserRouter as Router } from 'react-router-dom';

// Components
// import { NavBar } from './navigation/NavBar';
// import { OperatorNavBar } from './navigation/OperatorNavBar';
import { NavRoutes } from './navigation/NavRoutes';
import { UserProvider } from './context/UserProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';


/**
 * NavigationWrapper Component
 * Conditionally renders the appropriate navigation bar based on current route
 */
// const NavigationWrapper: React.FC = () => {
//   const location = useLocation();

//   // Hide navbar for match scoring (full-screen experience), team schedule, and stats pages
//   const hideNavbar = (location.pathname.includes('/match/') &&
//                      (location.pathname.endsWith('/score') ||
//                       location.pathname.endsWith('/lineup'))) ||
//                      location.pathname.match(/^\/team\/[^/]+\/schedule$/) ||
//                      location.pathname.includes('/standings') ||
//                      location.pathname.includes('/top-shooters') ||
//                      location.pathname.includes('/team-stats') ||
//                      location.pathname.includes('/feats') ||
//                      location.pathname.includes('/match-data');

//   // Show OperatorNavBar for operator routes
//   const isOperatorRoute = location.pathname.startsWith('/operator') ||
//                          location.pathname.startsWith('/create-league') ||
//                          location.pathname.startsWith('/league/');

//   if (hideNavbar) return null;

//   return isOperatorRoute ? <OperatorNavBar /> : <NavBar />;
// };

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div
        style={{ minHeight: '100vh', minWidth: '100vw' }}
        className="full-screen"
      >
        <UserProvider>
          <Router>
            {/*
            <NavigationWrapper />
            */}
            <NavRoutes />
          </Router>
        </UserProvider>
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default App;
