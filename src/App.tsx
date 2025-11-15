// Navigation
import { BrowserRouter as Router, useLocation } from 'react-router-dom';

// Components
import { NavBar } from './navigation/NavBar';
import { OperatorNavBar } from './navigation/OperatorNavBar';
import { NavRoutes } from './navigation/NavRoutes';
import { UserProvider } from './context/UserProvider';


/**
 * NavigationWrapper Component
 * Conditionally renders the appropriate navigation bar based on current route
 */
const NavigationWrapper: React.FC = () => {
  const location = useLocation();

  // Hide navbar for match scoring (full-screen experience) and team schedule
  const hideNavbar = (location.pathname.includes('/match/') &&
                     (location.pathname.endsWith('/score') ||
                      location.pathname.endsWith('/lineup'))) ||
                     location.pathname.match(/^\/team\/[^/]+\/schedule$/);

  // Show OperatorNavBar for operator routes
  const isOperatorRoute = location.pathname.startsWith('/operator') ||
                         location.pathname.startsWith('/create-league') ||
                         location.pathname.startsWith('/league/');

  if (hideNavbar) return null;

  return isOperatorRoute ? <OperatorNavBar /> : <NavBar />;
};

const App: React.FC = () => {
  return (
    <div
      style={{ minHeight: '100vh', minWidth: '100vw' }}
      className="full-screen"
    >
      <UserProvider>
        <Router>
          <NavigationWrapper />
          <NavRoutes />
        </Router>
      </UserProvider>
    </div>
  );
};

export default App;
