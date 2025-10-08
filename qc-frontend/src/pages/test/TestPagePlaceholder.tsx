import React from 'react';
import { Container, Typography } from '@mui/material';

interface TestPageProps {
  title: string;
  description?: string;
}

const TestPagePlaceholder: React.FC<TestPageProps> = ({ title, description }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1">
        {description || 'This is a test page under development.'}
      </Typography>
    </Container>
  );
};

export default TestPagePlaceholder;
