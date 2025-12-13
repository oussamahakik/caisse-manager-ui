import React from 'react';
import { clsx } from 'clsx';

/**
 * Composant Input standardisé
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.error
 * @param {React.ReactNode} props.icon
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 */
const Input = ({
  label,
  error,
  icon,
  size = 'md',
  className,
  id,
  ...props
}) => {
  const baseStyles = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const stateStyles = error
    ? 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50 dark:bg-error-900/20'
    : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500';

  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            baseStyles,
            sizeStyles[size],
            stateStyles,
            icon && 'pl-10',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-error-600 dark:text-error-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;




