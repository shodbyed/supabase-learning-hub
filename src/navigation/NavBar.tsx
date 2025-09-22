import { NavLink } from 'react-router-dom';

export const NavBar: React.FC = () => {
  return (
    <nav className="flex w-full py-2 border-b border-slate-300 px-6">
      <ul className="flex gap-5 list-none m-0 p-0">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-blue-600 hover:underline ${isActive ? 'font-semibold' : ''}`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-blue-600 hover:underline ${isActive ? 'font-semibold' : ''}`
            }
          >
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
