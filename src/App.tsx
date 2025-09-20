import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Login } from './login/Login';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('test-table').select('*');
      if (error) {
        console.error(
          'Error connecting to Supabase:',
          error.message,
          error.details
        );
      } else {
        console.log('Supabase connection successful:', data);
      }
    };

    testConnection();
  }, []);

  return (
    <div>
      <h1>Supabase Learning Hub</h1>
      <Login />
    </div>
  );
};

export default App;
