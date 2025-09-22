import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input'; // shadcn Input component
import { Label } from '@/components/ui/label'; // shadcn Label component
import { Button } from '@/components/ui/button'; // shadcn Button component
import {
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { LoginCard } from './LoginCard';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      setMessage('Login successful!');
      setLoading(false);
      navigate('/'); // Redirect Home
    }
  };

  return (
    <LoginCard title="Login">
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
      <div className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <CardAction>
        <Button variant="secondary" onClick={handleLogin} disabled={loading} message={message}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </CardAction>
    </LoginCard>
  );
};
