import React from 'react';
import { LinearProgress } from '@mui/material';
import type { LinearProgressProps } from '@mui/material';

export const Progress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  (props, ref) => {
    return <LinearProgress ref={ref} {...props} />;
  }
);

Progress.displayName = 'Progress';
