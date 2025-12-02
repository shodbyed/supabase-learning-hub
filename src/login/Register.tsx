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
            required
          />
        </div>
        <CardAction>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
          {message && (
            <p className="text-sm mt-2 text-red-500">
              {message}
            </p>
          )}
        </CardAction>
      </form>
      <CardFooter className="mt-4 text-sm flex justify-around w-full">
        <Link to="/login">Already have an account? Login</Link>
      </CardFooter>
    </LoginCard>
  );
};
