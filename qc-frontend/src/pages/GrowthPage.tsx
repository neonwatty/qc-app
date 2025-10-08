import React from 'react';
import { Box, Container, Typography, Paper, Card, CardContent, LinearProgress } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import { Star as StarIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { useAppSelector } from '@hooks/redux';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'achievement' | 'milestone';
}

const GrowthPage: React.FC = () => {
  const user = useAppSelector(state => state.auth?.user);

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First Check-in Together',
      description: 'Completed your first relationship check-in',
      date: new Date('2025-01-01'),
      type: 'achievement'
    },
    {
      id: '2',
      title: '30-Day Streak',
      description: 'Maintained daily check-ins for 30 days',
      date: new Date('2025-01-30'),
      type: 'milestone'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Growth Gallery
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress variant="determinate" value={65} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                65%
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            You're doing great! Keep up the consistent check-ins.
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Milestones
      </Typography>

      <Timeline position="alternate">
        {milestones.map((milestone, index) => (
          <TimelineItem key={milestone.id}>
            <TimelineSeparator>
              <TimelineDot color={milestone.type === 'achievement' ? 'primary' : 'secondary'}>
                {milestone.type === 'achievement' ? <StarIcon /> : <TrophyIcon />}
              </TimelineDot>
              {index < milestones.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" component="h1">
                  {milestone.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {milestone.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {milestone.date.toLocaleDateString()}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
};

export default GrowthPage;