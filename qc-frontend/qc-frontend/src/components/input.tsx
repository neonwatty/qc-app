import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export type InputProps = Omit<TextFieldProps, 'variant'>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="outlined"
        size="small"
        fullWidth
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
