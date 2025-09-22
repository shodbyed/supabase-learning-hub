import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { Login } from '../login/Login';
import { Register } from '../login/Register';
import { EmailConfirmation } from '../login/EmailConfirmation';
import { About } from '../about/About';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/confirm', element: <EmailConfirmation /> },
];

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
