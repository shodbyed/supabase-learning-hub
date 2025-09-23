import { Link } from 'react-router-dom';
import { privateRoutes, adminRoutes } from './routes';

export const PrivateNav = () => {
  return (
    <>
      {privateRoutes.map((route, index) => {
        if (route.link) {
          return (
            <li key={index}>
              <Link to={route.path}>{route.name}</Link>
            </li>
          );
        }
      })}
    </>
  );
};

export const AdminNav = () => {
  return (
    <>
      {adminRoutes.map((route, index) => (
        <li key={index}>
          <Link to={route.path}>{route.name}</Link>
        </li>
      ))}
    </>
  );
};
