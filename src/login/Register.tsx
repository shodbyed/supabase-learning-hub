import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardAction, CardFooter } from '@/components/ui/card';
import { LoginCard } from './LoginCard';
import { Mail } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setOauthLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
      setOauthLoading(false);
    }
    // Note: On success, user is redirected to Google, so no need to handle success here
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    // Basic validation
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    // Register with Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsSuccess(false);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setResendMessage(`Error: ${error.message}`);
    } else {
      setResendMessage('Verification email sent!');
    }
    setResendLoading(false);
  };

  // Show success card after registration
  if (isSuccess) {
    return (
      <LoginCard
        title="Registration Success!"
        description="Check your email to complete registration"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-gray-700">
            We sent a verification email to <strong>{email}</strong>
          </p>
          <p className="text-gray-600 text-sm">
            Click the link in your email to verify your account and log in automatically.
          </p>
          <div className="pt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://gmail.com', '_blank')}
            >
              Open Gmail
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://outlook.com', '_blank')}
            >
              Open Outlook
            </Button>
          </div>
          <div className="pt-2 border-t">
            <p className="text-gray-500 text-sm mb-2">Didn't receive the email?</p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleResendEmail}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            {resendMessage && (
              <p className={`text-sm mt-2 ${resendMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>
        </div>
        <CardFooter className="mt-4 text-sm flex justify-around w-full">
          <Link to="/login">Back to Login</Link>
        </CardFooter>
      </LoginCard>
    );
  }

  return (
    <LoginCard
      title="Register"
      description="Create a new account to get started"
    >
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <CardAction>
          <Button
            type="submit"
            loadingText="Creating Account..."
            isLoading={loading}
            disabled={loading}
          >
            Register
          </Button>
          {message && (
            <p className="text-sm mt-2 text-red-500">
              {message}
            </p>
          )}
        </CardAction>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignup}
        disabled={oauthLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {oauthLoading ? 'Connecting...' : 'Sign up with Google'}
      </Button>

      <CardFooter className="mt-4 text-sm flex justify-around w-full">
        <Link to="/login">Already have an account? Login</Link>
      </CardFooter>
    </LoginCard>
  );
};
