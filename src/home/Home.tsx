import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Supabase Learning Hub</h1>
      <p>This is the home page of your application.</p>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};
