/**
 * @fileoverview Reusable Page Header Component
 *
 * Provides consistent header styling across pages with:
 * - Back navigation link
 * - Page title
 * - Optional subtitle
 * - Sticky positioning
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  /** Path to navigate back to (use with Link) */
  backTo?: string;
  /** Text for the back link (e.g., "Back to My Teams") */
  backLabel?: string;
  /** Optional onClick handler for back button (overrides backTo Link behavior) */
  onBackClick?: () => void;
  /** Main page title */
  hideBack?: boolean;
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional children to render below title/subtitle (e.g., action buttons) */
  children?: React.ReactNode;
}

/**
 * Reusable page header component
 *
 * Provides consistent sticky header with back navigation
 *
 * @example
 * <PageHeader
 *   backTo="/my-teams"
 *   backLabel="Back to My Teams"
 *   title="Team Schedule"
 *   subtitle="Mondays"
 * />
 */
export function PageHeader({ backTo, backLabel, onBackClick, hideBack = false, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="px-4 py-3">
        {!hideBack && backLabel && (
          onBackClick ? (
            <button
              onClick={onBackClick}
              className="flex items-center gap-2 text-sm text-gray-600 mb-2 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          ) : backTo ? (
            <Link to={backTo} className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null
        )}
        <div className="text-2xl lg:text-4xl font-semibold text-gray-900">{title}</div>
        {subtitle && (
          <p className="text-md lg:text-xl text-gray-600">{subtitle}</p>
        )}
        {children}
      </div>
    </header>
  );
}
