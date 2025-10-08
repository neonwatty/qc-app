import React from 'react';
import { Card as MuiCard, CardContent as MuiCardContent, Typography } from '@mui/material';
import type { CardProps as MuiCardProps, CardContentProps as MuiCardContentProps } from '@mui/material';

export const Card = React.forwardRef<HTMLDivElement, MuiCardProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiCard ref={ref} {...props}>
        {children}
      </MuiCard>
    );
  }
);

export const CardContent = React.forwardRef<HTMLDivElement, MuiCardContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiCardContent ref={ref} {...props}>
        {children}
      </MuiCardContent>
    );
  }
);

export const CardHeader = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }} {...props}>
        {children}
      </div>
    );
  }
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="h6" className={className} {...props}>
        {children}
      </Typography>
    );
  }
);

export const CardDescription = React.forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <Typography ref={ref} variant="body2" color="text.secondary" className={className} {...props}>
        {children}
      </Typography>
    );
  }
);

Card.displayName = 'Card';
CardContent.displayName = 'CardContent';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
