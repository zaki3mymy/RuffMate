/**
 * Header component
 * App header with branding, version info, and theme toggle
 */

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme as useMuiTheme,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useUIStore } from '@/store';
import { useRulesStore } from '@/store';

/**
 * Header component
 */
export const Header = () => {
  const muiTheme = useMuiTheme();
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const ruffVersion = useRulesStore((state) => state.ruffVersion);

  const themeIcon = theme === 'dark' ? <Brightness7 /> : <Brightness4 />;
  const themeLabel =
    theme === 'dark'
      ? 'Toggle theme (current: dark mode)'
      : 'Toggle theme (current: light mode)';

  return (
    <AppBar
      position="static"
      component="header"
      role="banner"
      sx={{
        bgcolor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        boxShadow: 1,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left side: App branding and info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 'bold', color: muiTheme.palette.primary.main }}
          >
            RuffMate
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: muiTheme.palette.text.secondary,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Ruff Configuration Manager
          </Typography>

          {ruffVersion && ruffVersion.trim() !== '' && (
            <Typography
              variant="caption"
              sx={{
                color: muiTheme.palette.text.secondary,
                bgcolor: muiTheme.palette.action.hover,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: { xs: 'none', md: 'block' },
              }}
            >
              Ruff v{ruffVersion}
            </Typography>
          )}
        </Box>

        {/* Right side: Theme toggle */}
        <IconButton
          onClick={toggleTheme}
          aria-label={themeLabel}
          color="inherit"
          sx={{
            '&:hover': {
              bgcolor: muiTheme.palette.action.hover,
            },
          }}
        >
          {themeIcon}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
