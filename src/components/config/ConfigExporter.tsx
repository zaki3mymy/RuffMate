/**
 * ConfigExporter component
 * Dialog for exporting Ruff configuration in different formats
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useRulesStore, useUIStore } from '@/store';
import { generateRuffConfig } from '@/services/configGenerator';

type ExportFormat = 'toml' | 'json';

/**
 * ConfigExporter component
 */
export const ConfigExporter = () => {
  const theme = useTheme();
  const rules = useRulesStore((state) => state.rules);
  const exportDialogOpen = useUIStore((state) => state.exportDialogOpen);
  const closeExportDialog = useUIStore((state) => state.closeExportDialog);
  const showNotification = useUIStore((state) => state.showNotification);

  const [format, setFormat] = useState<ExportFormat>('toml');

  // Generate configuration based on selected format
  const configContent = generateRuffConfig(rules, format);

  // Get filename based on format
  const getFilename = (): string => {
    switch (format) {
      case 'toml':
        return 'ruff.toml';
      case 'json':
        return 'pyproject.json';
      default:
        return 'ruff.toml';
    }
  };

  // Handle format change
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(event.target.value as ExportFormat);
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configContent);
      showNotification('Configuration copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  // Handle download
  const handleDownload = () => {
    try {
      // Create blob and download link
      const blob = new Blob([configContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification(`Configuration downloaded as ${getFilename()}`, 'success');
    } catch (error) {
      console.error('Failed to download configuration:', error);
      showNotification('Failed to download configuration', 'error');
    }
  };

  // Handle dialog close
  const handleClose = () => {
    closeExportDialog();
  };

  return (
    <Dialog
      open={exportDialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="export-dialog-title"
    >
      {/* Dialog Title */}
      <DialogTitle id="export-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Export Configuration</Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Close dialog"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent>
        {/* Format Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Export Format
          </Typography>
          <RadioGroup
            value={format}
            onChange={handleFormatChange}
            row
          >
            <FormControlLabel
              value="toml"
              control={<Radio />}
              label="TOML (ruff.toml)"
            />
            <FormControlLabel
              value="json"
              control={<Radio />}
              label="JSON (pyproject.json)"
            />
          </RadioGroup>
        </Box>

        {/* Configuration Preview */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Preview
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: theme.palette.background.default,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'auto',
              maxHeight: '400px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <code>{configContent}</code>
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCopy}
          startIcon={<CopyIcon />}
          variant="outlined"
          aria-label="Copy to clipboard"
        >
          Copy
        </Button>
        <Button
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          variant="contained"
          aria-label="Download configuration file"
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};
