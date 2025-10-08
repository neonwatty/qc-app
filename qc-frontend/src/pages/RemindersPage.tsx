import React, { useState } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, ListItemIcon, Switch, Paper, Button, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { Notifications as NotificationsIcon, Schedule as ScheduleIcon, Add as AddIcon } from '@mui/icons-material';
import { useAppSelector } from '@hooks/redux';

interface Reminder {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  days?: string[];
}

const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Weekly Check-in',
      frequency: 'weekly',
      time: '19:00',
      enabled: true,
      days: ['Sunday']
    },
    {
      id: '2',
      title: 'Monthly Relationship Review',
      frequency: 'monthly',
      time: '20:00',
      enabled: true
    }
  ]);

  const handleToggle = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reminders
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 3 }}
        fullWidth
      >
        Add New Reminder
      </Button>

      <List>
        {reminders.map((reminder) => (
          <Paper key={reminder.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color={reminder.enabled ? 'primary' : 'disabled'} />
              </ListItemIcon>
              <ListItemText
                primary={reminder.title}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="body2">
                      {reminder.time}
                    </Typography>
                    <Chip
                      label={reminder.frequency}
                      size="small"
                      color={reminder.enabled ? 'primary' : 'default'}
                    />
                    {reminder.days && reminder.days.map(day => (
                      <Chip key={day} label={day} size="small" variant="outlined" />
                    ))}
                  </Box>
                }
              />
              <Switch
                edge="end"
                checked={reminder.enabled}
                onChange={() => handleToggle(reminder.id)}
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Default Reminder Time</InputLabel>
          <Select defaultValue="19:00" label="Default Reminder Time">
            <MenuItem value="08:00">8:00 AM</MenuItem>
            <MenuItem value="12:00">12:00 PM</MenuItem>
            <MenuItem value="19:00">7:00 PM</MenuItem>
            <MenuItem value="21:00">9:00 PM</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Container>
  );
};

export default RemindersPage;