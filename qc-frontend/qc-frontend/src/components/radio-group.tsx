import React from 'react';
import { RadioGroup as MuiRadioGroup, Radio, FormControlLabel } from '@mui/material';
import type { RadioGroupProps as MuiRadioGroupProps } from '@mui/material';

export const RadioGroup = React.forwardRef<HTMLDivElement, MuiRadioGroupProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiRadioGroup ref={ref} {...props}>
        {children}
      </MuiRadioGroup>
    );
  }
);

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  { value: string; label?: string; id?: string }
>(({ value, label, id }, ref) => {
  return (
    <FormControlLabel
      value={value}
      control={<Radio ref={ref} id={id} />}
      label={label || value}
    />
  );
});

RadioGroup.displayName = 'RadioGroup';
RadioGroupItem.displayName = 'RadioGroupItem';
