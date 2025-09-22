import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { useUserProfile, type UserRole } from '../hooks/useUserProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requireApprovedApplication?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requireApprovedApplication = false,
  redirectTo = '/login',
}) => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  // Show loading while checking member
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if specific role is required
  if (requiredRole && member?.role !== requiredRole) {
    // If user doesn't have required role, redirect to appropriate page
    if (member?.role === 'player') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if approved application is required (member record exists)
  if (requireApprovedApplication && !member) {
    return <Navigate to="/new-player" replace />;
  }

  return <>{children}</>;
};