import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showNewBtn = !location.pathname.includes('/new');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Toolbar>
          <AutoAwesomeIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: 'text.primary', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => navigate('/projects')}
          >
            SEO Platform
          </Typography>
          {showNewBtn && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/new')}
              size="small"
            >
              Новый проект
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
