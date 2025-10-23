/**
 * @fileoverview DashboardCard Component
 * Reusable card component for operator dashboard quick actions
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardCardProps {
  /** Icon element to display (lucide-react icon) */
  icon: React.ReactNode;
  /** Icon color class (e.g., 'text-blue-600') */
  iconColor: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Button text */
  buttonText: string;
  /** Button link path (if link card) */
  linkTo?: string;
  /** Button click handler (if action card) */
  onClick?: () => void;
  /** Button variant */
  variant?: 'default' | 'outline';
  /** Button background color (for primary actions) */
  buttonColor?: string;
}

/**
 * DashboardCard Component
 *
 * Displays a quick action card on the operator dashboard with:
 * - Icon and title
 * - Description text
 * - Action button (either Link or onClick)
 * - Hover effect
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  iconColor,
  title,
  description,
  buttonText,
  linkTo,
  onClick,
  variant = 'outline',
  buttonColor,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={iconColor}>{icon}</div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {linkTo ? (
        <Button
          asChild
          variant={variant}
          className="w-full"
          style={buttonColor ? { backgroundColor: buttonColor, color: 'white' } : undefined}
        >
          <Link to={linkTo}>{buttonText}</Link>
        </Button>
      ) : (
        <Button
          variant={variant}
          className="w-full"
          onClick={onClick}
          style={buttonColor ? { backgroundColor: buttonColor, color: 'white' } : undefined}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
