/**
 * @fileoverview Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application. This is a React
 * best practice for production apps.
 *
 * Must be a class component - React error boundaries don't support hooks.
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  /** Optional custom fallback component */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 *
 * Wraps the application to catch rendering errors and display a friendly
 * error page instead of a white screen. Logs errors to Supabase via logger.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state when an error is caught
   * Called during the "render" phase - no side effects allowed
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error information
   * Called during the "commit" phase - side effects allowed
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to Supabase for production monitoring
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  /**
   * Reset error state - allows user to retry
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default ErrorFallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
