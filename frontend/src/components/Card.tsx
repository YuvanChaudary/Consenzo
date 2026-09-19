import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'success' | 'warning' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return '1rem';
      case 'lg': return '2rem';
      case 'md':
      default: return '1.5rem';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'glow': return 'glass-card glass-card-glow';
      case 'success': return 'glass-card glass-card-success';
      case 'warning': return 'glass-card';
      case 'glass':
      case 'default':
      default: return 'glass-card';
    }
  };

  return (
    <div
      className={`${getVariantClass()} ${className}`}
      style={{
        padding: getPadding(),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};
