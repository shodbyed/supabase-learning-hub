import { NavLink, Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

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

      {/* Right side - messages and operator access */}
      <div className="flex items-center gap-3">
        {hasMemberRecord() && (
          <Link to="/messages" className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Mail className="h-5 w-5" />
              {/* Unread badge - will be dynamic later */}
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </Link>
        )}

        {canAccessLeagueOperatorFeatures() && (
          <Button asChild variant="outline" size="sm">
            <Link to="/operator-dashboard">
              🎱 League Admin
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
};
