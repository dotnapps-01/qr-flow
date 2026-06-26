import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';
import './Badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx('badge', `badge-${variant}`, className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
