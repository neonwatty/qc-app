import React from 'react';
import { FormLabel } from '@mui/material';
import type { FormLabelProps } from '@mui/material';

export const Label = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, ...props }, ref) => {
    return (
      <FormLabel ref={ref} {...props}>
        {children}
      </FormLabel>
    );
  }
);

Label.displayName = 'Label';
