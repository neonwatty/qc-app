import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, IconButton, Fab, TextField, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { useAppSelector } from '@hooks/redux';

interface Note {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  tags: string[];
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAppSelector(state => state.auth?.user);

  useEffect(() => {
    // TODO: Fetch notes from API
    setNotes([
      {
        id: '1',
        content: 'Remember to discuss vacation plans',
        isPrivate: false,
        createdAt: new Date(),
        tags: ['planning', 'vacation']
      }
    ]);
  }, []);

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notes
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <List>
        {filteredNotes.map((note) => (
          <Paper key={note.id} sx={{ mb: 2, p: 2 }}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {note.content}
                    {note.isPrivate ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {note.createdAt.toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {note.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default NotesPage;