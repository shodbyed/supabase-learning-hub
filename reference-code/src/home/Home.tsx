import { Login } from '../login/Login';
import { LogoutButton } from '../login/LogoutButton';
import { useAuthContext } from '../context/useAuthContext';
import { toast } from 'react-toastify';
import { LoadingScreen } from '../components/LoadingScreen';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import './home.css';

export const Home = () => {
  const navigate = useNavigate();
  const {
    isAdmin,
    user,
    player,
    isError: isPlayerError,
    isLoading: isLoadingPlayer,
  } = useAuthContext();

  useEffect(() => {
    if (isPlayerError && !isLoadingPlayer) {
      navigate('/signUp');
    }
  }, [isPlayerError, navigate, isLoadingPlayer]);

  if (isLoadingPlayer) {
    return <LoadingScreen message="Grabbing user data" />;
  }

  const welcomeName = player?.firstName || '';
  const adminMessage = isAdmin
    ? 'Please navigate to "seasons" to create a new season'
    : 'If you wish to be a League Operator, please press the Apply button';

  const testConfirm = async () => {
    toast.info('Coming Soon');
    //TODO make an application form
  };

  if (user) {
    return (
      <div className="home-container">
        <h2>
          Welcome to the Pool League Management System{` ${welcomeName}`}!
        </h2>
        <h4>{adminMessage}</h4>
        {/* Additional content or navigation options */}
        <div className="home-buttons">
          <button onClick={testConfirm}>Apply</button>
          <LogoutButton />
        </div>
      </div>
    );
  } else {
    return <Login />;
  }
};
