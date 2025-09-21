import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Supabase Learning Hub</h1>
      <p>Here is where we tell you all about this website.</p>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};
