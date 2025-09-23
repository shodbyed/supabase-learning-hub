import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

import './newPlayers.css';
// added comment to redeploy x2
export const WelcomePage = () => {
  const googleFormURL = 'https://forms.gle/Tn8xjYhpWRwdHLxp7';
  const { player } = useAuthContext();
  const navigate = useNavigate();

  const handleFeedback = () => {
    window.open(googleFormURL, '_blank', 'noopener,noreferrer');
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <div className="sign-container">
      <h1>Hello {player?.firstName}!</h1>
      <div className="welcome-message">
        Your Profile has been successfully created.
      </div>
      <div className="welcome-message">
        Welcome to our new league system! Here are a few things you need to
        know:
      </div>
      <div className="welcome-grid-container">
        <div className="welcome-title">Website and App</div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">One Login:</span>
          <span className="welcome-point">
            Use the same email and password for both this Website and the Phone
            App
          </span>
        </div>
        <div className="welcome-title">Website (Mainly for Admins)</div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Become a League Operator:</span>
          <span className="welcome-point">
            This website is your go-to for managing your league operations
          </span>
        </div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Profile Management:</span>
          <span className="welcome-point">
            View and Update your personal information and profile.
          </span>
        </div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Stats and Standings: </span>
          <span className="welcome-point">
            View your personal, as well as team, Statistics and Standings
          </span>
        </div>
        <div className="welcome-title">Phone App</div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Player Focused:</span>
          <span className="welcome-point">
            Everything you need as a Player will be available on the Phone App.
          </span>
        </div>
        <div className="welcome-title">Development Note</div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Features:</span>
          <span className="welcome-point">
            Please be patient. Not all features are available on the website and
            app yet.
          </span>
        </div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Work in Progress:</span>
          <span className="welcome-point">
            We are constantly working on improving and adding features to the
            website and app, so stay tuned.
          </span>
        </div>
        <div className="welcome-grid-item">
          <span className="welcome-bullet">Suggestions:</span>
          <span className="welcome-point">
            We are very interested in your feedback and suggestions.
            <a
              style={{ marginLeft: '10px' }}
              href={googleFormURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Please reach out to us here
            </a>
            !
          </span>
        </div>
      </div>
      <div className="welcome-buttons">
        <button onClick={handleNavigateHome}>Home</button>
        <button onClick={handleFeedback}>Feedback</button>
      </div>
    </div>
  );
};
