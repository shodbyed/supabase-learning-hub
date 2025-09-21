import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { Login } from '../login/Login';
import { About } from '../about/About';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/login', element: <Login /> },
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
