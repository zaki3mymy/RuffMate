/**
 * RuleCard component
 * Displays individual Ruff rule with toggle, badges, and detailed information
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Box,
  Chip,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useRulesStore } from '@/store';
import type { RuffRule } from '@/types';

interface RuleCardProps {
  rule: RuffRule;
}

/**
 * RuleCard component
 */
export const RuleCard = ({ rule }: RuleCardProps) => {
  const theme = useTheme();
  const toggleRule = useRulesStore((state) => state.toggleRule);
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    toggleRule(rule.code);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Get legend status from legendInfo
  const legendStatus = rule.legendInfo.status;

  // Determine legend badge color
  const getLegendColor = () => {
    switch (legendStatus) {
      case 'deprecated':
        return 'error';
      case 'preview':
        return 'warning';
      case 'stable':
        return 'success';
      default:
        return 'default';
    }
  };

  // Check if rule is fixable
  const isFixable = rule.legendInfo.fixable;

  return (
    <Card
      sx={{
        opacity: rule.enabled ? 1 : 0.6,
        transition: 'opacity 0.2s',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        {/* Header: Code, Name, and Toggle */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            {/* Rule Code and Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                }}
              >
                {rule.code}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {rule.name}
              </Typography>
            </Box>

            {/* Description (truncated) */}
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {rule.description}
            </Typography>

            {/* Badges: Legend Status, Fixable, Category */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {/* Legend Status Badge */}
              <Chip
                label={legendStatus}
                color={getLegendColor()}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />

              {/* Fixable Badge */}
              {isFixable && (
                <Chip
                  label="Fixable"
                  color="info"
                  size="small"
                  variant="outlined"
                />
              )}

              {/* Category */}
              {rule.category && rule.category.trim() !== '' && (
                <Chip
                  label={rule.category}
                  size="small"
                  variant="outlined"
                  sx={{ color: theme.palette.text.secondary }}
                />
              )}
            </Box>
          </Box>

          {/* Toggle Switch */}
          <Switch
            checked={rule.enabled}
            onChange={handleToggle}
            inputProps={{
              'aria-label': `Toggle rule ${rule.code} (current: ${rule.enabled ? 'enabled' : 'disabled'})`,
            }}
            color="primary"
          />
        </Box>

        {/* Ignore Reason (shown when disabled with reason) */}
        {!rule.enabled && rule.ignoreReason && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: theme.palette.action.hover,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Reason:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {rule.ignoreReason}
            </Typography>
          </Box>
        )}

        {/* Expand/Collapse for Detailed Description */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <IconButton
            onClick={handleExpandClick}
            aria-label={expanded ? 'Hide details' : 'Show details'}
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {expanded ? 'Hide details' : 'Show details'}
          </Typography>
        </Box>

        {/* Detailed Description (Collapsible) */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: theme.palette.background.default,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">{rule.description}</Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};
