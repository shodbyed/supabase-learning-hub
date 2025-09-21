/* import { useEffect } from 'react';
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
*/
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NavBar } from './navigation/NavBar';
import { NavRoutes } from './navigation/NavRoutes';
import './App.css';

const App: React.FC = () => {
  return (
    <div
      style={{ minHeight: '100vh', minWidth: '100vw' }}
      className="full-screen"
    >
      <Router>
        <NavBar />

        <NavRoutes />
      </Router>
    </div>
  );
};

export default App;
