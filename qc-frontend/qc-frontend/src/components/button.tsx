import React from 'react';
import { Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  // Additional custom props can be added here
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiButton ref={ref} {...props}>
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;