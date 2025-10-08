import React from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Switch, Divider, Button, Box } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@hooks/redux';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth?.user);

  const handleLogout = () => {
    // TODO: Dispatch logout action
    console.log('Logging out...');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccountIcon />
            </ListItemIcon>
            <ListItemText
              primary="Account"
              secondary={user?.email || 'user@example.com'}
            />
            <Button variant="outlined" size="small">
              Edit Profile
            </Button>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Push Notifications"
              secondary="Receive reminders for check-ins"
            />
            <Switch defaultChecked />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <DarkModeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dark Mode"
              secondary="Reduce eye strain in low light"
            />
            <Switch />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText
              primary="Language"
              secondary="English"
            />
            <Button variant="text" size="small">
              Change
            </Button>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="Privacy & Security"
              secondary="Manage your data and privacy settings"
            />
            <Button variant="text" size="small">
              Manage
            </Button>
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage;