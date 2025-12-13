import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Composant Card standardisé
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 * @param {boolean} props.hoverable
 * @param {boolean} props.padding - 'none' | 'sm' | 'md' | 'lg'
 */
const Card = ({
  children,
  className,
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'glass-strong rounded-2xl shadow-card transition-all duration-300 border border-slate-200/60 dark:border-slate-700/70';
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable
    ? 'hover:shadow-card-hover hover:scale-[1.01] cursor-pointer'
    : '';

  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={clsx(baseStyles, paddingStyles[padding], hoverStyles, className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Composant CardHeader pour les en-têtes de cartes
 */
export const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx('mb-4', className)} {...props}>
    {children}
  </div>
);

/**
 * Composant CardTitle pour les titres de cartes
 */
export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={clsx('text-h3 font-bold text-slate-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);

/**
 * Composant CardContent pour le contenu des cartes
 */
export const CardContent = ({ children, className, ...props }) => (
  <div className={clsx('text-body text-slate-700 dark:text-slate-300', className)} {...props}>
    {children}
  </div>
);

/**
 * Composant CardFooter pour les pieds de cartes
 */
export const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx('mt-4 pt-4 border-t border-slate-200 dark:border-slate-700', className)} {...props}>
    {children}
  </div>
);

export default Card;




