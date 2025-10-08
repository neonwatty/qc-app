import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export type TextareaProps = Omit<TextFieldProps, 'multiline'>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        multiline
        variant="outlined"
        rows={4}
        fullWidth
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
