import { NavLink, Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { Button } from '@/components/ui/button';

export const NavBar: React.FC = () => {
  const { hasMemberRecord, canAccessLeagueOperatorFeatures } = useUserProfile();

  return (
    <nav className="flex w-full py-2 border-b border-slate-300 px-6 justify-between items-center">
      {/* Left side - main navigation */}
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
        {hasMemberRecord() && (
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `text-blue-600 hover:underline ${isActive ? 'font-semibold' : ''}`
              }
            >
              Profile
            </NavLink>
          </li>
        )}
      </ul>

      {/* Right side - operator access */}
      {canAccessLeagueOperatorFeatures() && (
        <div className="flex items-center">
          <Button asChild variant="outline" size="sm">
            <Link to="/operator-dashboard">
              🎱 League Admin
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
};
