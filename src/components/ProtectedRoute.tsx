/**
 * @fileoverview Protected route component for authentication and authorization
 * Handles multiple levels of access control including authentication, roles, and application status
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { useUserProfile, type UserRole } from '../hooks/useUserProfile';

/**
 * Props for the ProtectedRoute component
 * Allows fine-grained control over access requirements
 */
interface ProtectedRouteProps {
  children: React.ReactNode; // Component to render if access is granted
  requireAuth?: boolean; // Whether user must be authenticated (default: true)
  requiredRole?: UserRole; // Specific role required to access this route
  requireApprovedApplication?: boolean; // Whether user must have completed member application
  redirectTo?: string; // Where to redirect if access is denied (default: '/login')
}

/**
 * Protected route wrapper component that handles authentication and authorization
 *
 * This component implements a hierarchical access control system:
 * 1. Authentication check (is user logged in?)
 * 2. Role-based access control (does user have required role?)
 * 3. Application status check (has user completed member application?)
 *
 * @param children - The component to render if all access checks pass
 * @param requireAuth - Whether authentication is required (default: true)
 * @param requiredRole - Specific role needed to access the route
 * @param requireApprovedApplication - Whether user needs completed member application
 * @param redirectTo - Fallback redirect path if access is denied
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requireApprovedApplication = false,
  redirectTo = '/login',
}) => {
  const { user } = useUser();
  const { member, loading } = useUserProfile();

  // Show loading state while fetching member data from Supabase
  if (loading) {
    return <div>Loading...</div>;
  }

  // First check: Authentication requirement
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Second check: Role-based access control
  if (requiredRole && member?.role !== requiredRole) {
    // Smart redirect based on user's actual role
    if (member?.role === 'player') {
      return <Navigate to="/dashboard" replace />; // Players go to their dashboard
    }
    return <Navigate to="/unauthorized" replace />; // Other roles get unauthorized page
  }

  // Third check: Application completion requirement
  if (requireApprovedApplication && !member) {
    return <Navigate to="/new-player" replace />; // Send to application form
  }

  // All checks passed - render the protected content
  return <>{children}</>;
};