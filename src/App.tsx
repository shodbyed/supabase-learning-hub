// Navigation
import { BrowserRouter as Router } from 'react-router-dom';

// Components
import { NavBar } from './navigation/NavBar';
import { NavRoutes } from './navigation/NavRoutes';
import { UserProvider } from './context/UserProvider';


const App: React.FC = () => {
  return (
    <div
      style={{ minHeight: '100vh', minWidth: '100vw' }}
      className="full-screen"
    >
      <UserProvider>
        <Router>
          <NavBar />
          <NavRoutes />
        </Router>
      </UserProvider>
    </div>
  );
};

export default App;
