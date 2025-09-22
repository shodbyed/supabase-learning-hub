import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { LoginCard } from './LoginCard';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    // TODO: Add forgot password functionality
    console.log('Forgot password clicked', { email });
  };

  return (
    <LoginCard title="Reset Password" description="Enter your email to receive a password reset link">
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <CardAction>
        <Button variant="secondary" onClick={handleForgotPassword} disabled={loading} message={message}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </CardAction>
      <CardFooter className="mt-4 text-sm flex justify-around w-full">
        <Link to="/login">Back to Login</Link>
        <Link to="/register">Create Account</Link>
      </CardFooter>
    </LoginCard>
  );
};