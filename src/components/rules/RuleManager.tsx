/**
 * RuleManager component
 * Main container for displaying and managing Ruff rules
 */

import { useState, useMemo, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewAgenda as ViewAgendaIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRulesStore, useUIStore } from '@/store';
import { RuleCard } from './RuleCard';
import type { ViewMode } from '@/types';

/**
 * RuleManager component
 */
export const RuleManager = () => {
  const theme = useTheme();
  const rules = useRulesStore((state) => state.rules);
  const searchQuery = useRulesStore((state) => state.searchQuery);
  const setSearchQuery = useRulesStore((state) => state.setSearchQuery);
  const isLoading = useRulesStore((state) => state.isLoading);
  const error = useRulesStore((state) => state.error);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // Local state for search input
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Filter rules based on search query
  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) {
      return rules;
    }

    const query = searchQuery.toLowerCase();
    return rules.filter(
      (rule) =>
        rule.code.toLowerCase().includes(query) ||
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.category.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);
    setSearchQuery(value);
  };

  // Handle view mode change
  const handleViewModeChange = (_event: unknown, newViewMode: ViewMode | null) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box
        role="main"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box role="main" sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box component="main" role="main" sx={{ p: 3 }}>
      {/* Header: Search and View Mode */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <TextField
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Search rules..."
          label="Search rules"
          variant="outlined"
          size="small"
          sx={{ flex: 1, minWidth: '250px', maxWidth: '500px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          inputProps={{
            'aria-label': 'Search rules by code, name, description, or category',
          }}
        />

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="View mode"
          size="small"
        >
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Grid view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="detailed" aria-label="Detailed view">
            <ViewAgendaIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Rule Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {filteredRules.length} {filteredRules.length === 1 ? 'rule' : 'rules'}
        </Typography>
      </Box>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
            {searchQuery.trim()
              ? 'No rules found'
              : 'No rules available'}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {searchQuery.trim()
              ? 'Try adjusting your search query'
              : 'Please load rules to get started'}
          </Typography>
        </Box>
      )}

      {/* Rules List */}
      {filteredRules.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {filteredRules.map((rule) => (
            <RuleCard key={rule.code} rule={rule} />
          ))}
        </Box>
      )}
    </Box>
  );
};
