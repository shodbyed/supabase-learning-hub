/**
 * @fileoverview Development-Only Route Guard
 *
 * Wraps components/pages that should only be accessible in development mode.
 * In production, redirects to home page.
 */

import { Navigate } from 'react-router-dom';

interface DevOnlyProps {
  children: React.ReactNode;
}

export function DevOnly({ children }: DevOnlyProps) {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;

  if (!isDevelopment) {
    // Redirect to home in production
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
