import { NavLink } from 'react-router-dom';

export const NavBar: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/">Home2</NavLink>
        </li>
        <li>
          <NavLink to="/about">About2</NavLink>
        </li>
      </ul>
    </nav>
  );
};
