import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, CardActions, Button, Chip, Grid, IconButton, Badge } from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CancelIcon, Favorite as HeartIcon } from '@mui/icons-material';
import { useAppSelector } from '@hooks/redux';

interface Request {
  id: string;
  title: string;
  description: string;
  from: 'partner' | 'self';
  status: 'pending' | 'accepted' | 'declined';
  category: string;
  createdAt: Date;
}

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      title: 'Date Night',
      description: 'Let\'s have a romantic dinner this weekend',
      from: 'partner',
      status: 'pending',
      category: 'quality-time',
      createdAt: new Date('2025-01-20')
    },
    {
      id: '2',
      title: 'Morning Walk',
      description: 'Start our days with a 30-minute walk together',
      from: 'self',
      status: 'accepted',
      category: 'wellness',
      createdAt: new Date('2025-01-18')
    }
  ]);

  const handleAccept = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'accepted' } : r
    ));
  };

  const handleDecline = (id: string) => {
    setRequests(requests.map(r =>
      r.id === id ? { ...r, status: 'declined' } : r
    ));
  };

  const pendingCount = requests.filter(r => r.status === 'pending' && r.from === 'partner').length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h4">
          Partner Requests
        </Typography>
        {pendingCount > 0 && (
          <Badge badgeContent={pendingCount} color="primary">
            <HeartIcon color="action" />
          </Badge>
        )}
      </Box>

      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid item xs={12} md={6} key={request.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6">
                    {request.title}
                  </Typography>
                  <Chip
                    label={request.status}
                    size="small"
                    color={
                      request.status === 'accepted' ? 'success' :
                      request.status === 'declined' ? 'error' : 'default'
                    }
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {request.description}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip label={request.category} size="small" variant="outlined" />
                  <Chip
                    label={request.from === 'partner' ? 'From Partner' : 'From You'}
                    size="small"
                    variant="outlined"
                    color={request.from === 'partner' ? 'primary' : 'default'}
                  />
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {request.createdAt.toLocaleDateString()}
                </Typography>
              </CardContent>
              {request.status === 'pending' && request.from === 'partner' && (
                <CardActions>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleDecline(request.id)}
                  >
                    Decline
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RequestsPage;