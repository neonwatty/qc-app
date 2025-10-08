import React from 'react';
import { Container, Typography, Button, Stack, Box } from '@mui/material';

const TestButtonPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Button Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        Testing various button styles and states
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" gutterBottom>Variants</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="text">Text</Button>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Colors</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary">Primary</Button>
            <Button variant="contained" color="secondary">Secondary</Button>
            <Button variant="contained" color="success">Success</Button>
            <Button variant="contained" color="error">Error</Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Sizes</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" size="small">Small</Button>
            <Button variant="contained" size="medium">Medium</Button>
            <Button variant="contained" size="large">Large</Button>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>States</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained">Normal</Button>
            <Button variant="contained" disabled>Disabled</Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default TestButtonPage;