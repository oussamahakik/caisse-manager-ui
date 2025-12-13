import React from 'react';
import { clsx } from 'clsx';

/**
 * Composant Badge standardisé
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.children
 */
const Badge = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;




