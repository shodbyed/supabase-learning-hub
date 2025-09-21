import { Link } from 'react-router-dom';
import { useUser } from '../context/useUser';

export const Home: React.FC = () => {
  const { isLoggedIn, user } = useUser();

  console.log('User Object', user);
  return (
    <div>
      <h1>Welcome to the Supabase Learning Hub</h1>
      <p>This is the home page of your application.</p>
      {!isLoggedIn && <Link to="/login">Go to Login</Link>}
      {isLoggedIn && user && (
        <p>
          You are logged in as <strong>{user.email}</strong>.
        </p>
      )}
    </div>
  );
};
