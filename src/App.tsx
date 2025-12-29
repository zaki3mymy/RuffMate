/**
 * RuffMate Application Root Component
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import { Header } from '@/components/common';
import { RuleManager } from '@/components/rules';
import { ConfigExporter } from '@/components/config';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App(): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: 3,
          }}
        >
          <RuleManager />
        </Container>

        {/* Config Exporter Dialog */}
        <ConfigExporter />
      </Box>
    </ThemeProvider>
  );
}

export default App;
