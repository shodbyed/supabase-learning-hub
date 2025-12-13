import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardAction, CardFooter } from '@/components/ui/card';
import { LoginCard } from './LoginCard';
import { Link } from 'react-router-dom';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async () => {
      // Check if there are auth tokens in the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session using the tokens from the URL
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          setMessage('Invalid or expired reset link');
        } else {
          setMessage('Ready to reset your password');
        }
      } else {
        setMessage('Invalid or expired reset link');
      }
    };

    handleAuthChange();
  }, []);

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <LoginCard title="Reset Password" description="Enter your new password">
      <form onSubmit={handleResetPassword}>
        <div className="mb-4">
          <Label htmlFor="password">New Password</Label>
          <PasswordInput
            id="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <CardAction>
          <Button type="submit" loadingText="Updating..." isLoading={loading} disabled={loading} message={message}>
            Update Password
          </Button>
        </CardAction>
      </form>
      <CardFooter className="mt-4 text-sm flex justify-around w-full">
        <Link to="/login">Back to Login</Link>
      </CardFooter>
    </LoginCard>
  );
};