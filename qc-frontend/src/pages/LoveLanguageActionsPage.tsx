import React from 'react';
import { Container, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Checkbox, Box, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Favorite as HeartIcon } from '@mui/icons-material';
import { useAppSelector } from '@hooks/redux';

interface Action {
  id: string;
  text: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const LoveLanguageActionsPage: React.FC = () => {
  const { languageId } = useParams();
  const [actions, setActions] = React.useState<Action[]>([
    {
      id: '1',
      text: 'Leave a heartfelt note for your partner',
      completed: false,
      difficulty: 'easy'
    },
    {
      id: '2',
      text: 'Write a list of things you appreciate about them',
      completed: true,
      difficulty: 'easy'
    },
    {
      id: '3',
      text: 'Send an unexpected "thinking of you" message',
      completed: false,
      difficulty: 'easy'
    },
    {
      id: '4',
      text: 'Share a specific compliment about their character',
      completed: false,
      difficulty: 'medium'
    },
    {
      id: '5',
      text: 'Write a love letter expressing your feelings',
      completed: false,
      difficulty: 'hard'
    }
  ]);

  const handleToggle = (id: string) => {
    setActions(actions.map(action =>
      action.id === id ? { ...action, completed: !action.completed } : action
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const completedCount = actions.filter(a => a.completed).length;
  const completionPercentage = (completedCount / actions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Words of Affirmation Actions
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <HeartIcon color="primary" fontSize="large" />
            <Box flex={1}>
              <Typography variant="h6">
                Progress: {completedCount} / {actions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(completionPercentage)}% completed
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Suggested Actions
      </Typography>

      <List>
        {actions.map((action) => (
          <Card key={action.id} sx={{ mb: 1 }}>
            <ListItem
              dense
              button
              onClick={() => handleToggle(action.id)}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={action.completed}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      sx={{
                        textDecoration: action.completed ? 'line-through' : 'none',
                        color: action.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {action.text}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Chip
                    label={action.difficulty}
                    size="small"
                    color={getDifficultyColor(action.difficulty) as any}
                    sx={{ mt: 0.5 }}
                  />
                }
              />
            </ListItem>
          </Card>
        ))}
      </List>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            💡 Tip: Start with easy actions and work your way up. Consistency matters more than complexity!
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoveLanguageActionsPage;