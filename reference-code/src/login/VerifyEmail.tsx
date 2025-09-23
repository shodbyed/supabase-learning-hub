// react
import { Link } from 'react-router-dom';

// firebase
import { sendEmailVerification } from 'firebase/auth';
import { useAuthContext } from '../context/useAuthContext';

// css
import './login.css';

export const VerifyEmail = () => {
  const { user } = useAuthContext();

  const handleResendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    try {
      await sendEmailVerification(user);
      alert('Verification email sent!');
    } catch (error) {
      console.error('Error sending verification email', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleResendEmail} className="login-form">
      <h2>Email Verification</h2>
      <div
        style={{
          display: 'flex',
          fontSize: '15px',
          maxWidth: '80%',
          marginBottom: '25px',
        }}
      >
        Thank you for registering!
      </div>
      <div style={{ fontSize: '12px', maxWidth: '70%', marginBottom: '10px' }}>
        To log in, please check your inbox and follow the link to complete the
        verification process.
      </div>

      <div style={{ fontSize: '12px', maxWidth: '70%', marginBottom: '15px' }}>
        When finished proceed to Log In
      </div>

      <button className="mt-4 mb-12" type="submit">
        Resend Email
      </button>

      <Link to="/login" style={{ marginTop: '45px' }}>
        Back to Login
      </Link>
    </form>
  );
};
