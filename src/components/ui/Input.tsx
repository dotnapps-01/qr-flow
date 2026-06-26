import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, id, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        <input
          ref={ref}
          id={id}
          className={clsx(
            'input',
            { 'input-error': error },
            className
          )}
          {...props}
        />
        {error && <span className="input-message input-message-error">{error}</span>}
        {!error && helperText && <span className="input-message">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
