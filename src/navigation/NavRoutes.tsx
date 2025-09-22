import { Routes, Route } from 'react-router-dom';
import { Home } from '../home/Home';
import { Login } from '../login/Login';
import { Register } from '../login/Register';
import { ForgotPassword } from '../login/ForgotPassword';
import { ResetPassword } from '../login/ResetPassword';
import { EmailConfirmation } from '../login/EmailConfirmation';
import { About } from '../about/About';
import { NewPlayerForm } from '../newPlayer/NewPlayerForm';
import { Dashboard } from '../dashboard/Dashboard';
import { Profile } from '../profile/Profile';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const NavRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm" element={<EmailConfirmation />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/new-player"
        element={
          <ProtectedRoute requireAuth={true}>
            <NewPlayerForm />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - require authentication + member record */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAuth={true} requireApprovedApplication={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute requireAuth={true} requireApprovedApplication={true}>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
