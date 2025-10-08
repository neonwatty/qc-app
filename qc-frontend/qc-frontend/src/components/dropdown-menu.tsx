import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import type { MenuProps, MenuItemProps } from '@mui/material';

export const DropdownMenu = Menu;
export const DropdownMenuTrigger = React.Fragment;
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ children, ...props }, ref) => {
    return <div ref={ref}>{children}</div>;
  }
);
export const DropdownMenuItem = MenuItem;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <MenuItem disabled>{children}</MenuItem>
);
export const DropdownMenuSeparator = () => <hr style={{ margin: '4px 0' }} />;

DropdownMenuContent.displayName = 'DropdownMenuContent';
