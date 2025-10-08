import React from 'react';
import { Alert as MuiAlert } from '@mui/material';
import type { AlertProps as MuiAlertProps } from '@mui/material';

export const Alert = React.forwardRef<HTMLDivElement, MuiAlertProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiAlert ref={ref} {...props}>
        {children}
      </MuiAlert>
    );
  }
);

export const AlertDescription = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

Alert.displayName = 'Alert';
AlertDescription.displayName = 'AlertDescription';
