import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'subtle' | 'amazon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 14px var(--primary-glow)',
          border: '1px solid var(--border-accent)'
        };
      case 'secondary':
        return {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)'
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 14px var(--success-glow)',
          border: '1px solid var(--border-success)'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 14px var(--warning-glow)',
          border: '1px solid var(--border-warning)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 14px var(--danger-glow)',
          border: '1px solid rgba(239, 68, 68, 0.4)'
        };
      case 'amazon':
        return {
          background: 'linear-gradient(135deg, #ff9900 0%, #e68a00 100%)',
          color: '#111827',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(255, 153, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        };
      case 'subtle':
      default:
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent'
        };
    }
  };

  const getSizeStyle = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.4rem 0.75rem',
          fontSize: '0.825rem',
          borderRadius: 'var(--radius-sm)'
        };
      case 'lg':
        return {
          padding: '0.9rem 1.75rem',
          fontSize: '1.05rem',
          borderRadius: 'var(--radius-md)'
        };
      case 'md':
      default:
        return {
          padding: '0.65rem 1.25rem',
          fontSize: '0.925rem',
          borderRadius: 'var(--radius-md)'
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
    userSelect: 'none',
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...style
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={baseStyle}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.75s linear infinite'
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
