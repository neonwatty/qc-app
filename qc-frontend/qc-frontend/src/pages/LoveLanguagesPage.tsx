import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, LinearProgress, Box, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/redux';

interface LoveLanguage {
  id: string;
  name: string;
  score: number;
  description: string;
  icon: string;
}

const LoveLanguagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [languages] = useState<LoveLanguage[]>([
    {
      id: '1',
      name: 'Words of Affirmation',
      score: 85,
      description: 'Verbal acknowledgments and expressions of affection',
      icon: '💬'
    },
    {
      id: '2',
      name: 'Quality Time',
      score: 70,
      description: 'Giving undivided attention and being present',
      icon: '⏰'
    },
    {
      id: '3',
      name: 'Physical Touch',
      score: 60,
      description: 'Physical closeness and appropriate touch',
      icon: '🤝'
    },
    {
      id: '4',
      name: 'Acts of Service',
      score: 45,
      description: 'Doing helpful things for your partner',
      icon: '🛠️'
    },
    {
      id: '5',
      name: 'Receiving Gifts',
      score: 30,
      description: 'Thoughtful gifts and gestures',
      icon: '🎁'
    }
  ]);

  const primaryLanguage = languages.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Love Languages
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Primary Love Language
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h2">{primaryLanguage.icon}</Typography>
            <Box>
              <Typography variant="h5">{primaryLanguage.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {primaryLanguage.description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {languages.map((language) => (
          <Grid item xs={12} key={language.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h5">{language.icon}</Typography>
                    <Typography variant="h6">{language.name}</Typography>
                  </Box>
                  <Chip label={`${language.score}%`} color="primary" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={language.score} 
                  sx={{ mb: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {language.description}
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/love-languages/${language.id}/actions`)}
                >
                  View Actions
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            About Love Languages
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Understanding your love language helps you and your partner express and receive love more effectively.
          </Typography>
          <Button variant="contained" fullWidth>
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoveLanguagesPage;