import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** Label for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Color of the confirm button. Defaults to "error" for destructive actions. */
  confirmColor?: 'error' | 'warning' | 'primary' | 'success';
  /** Shows a spinner on the confirm button and disables both buttons while true. */
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmColor = 'error',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={isLoading ? undefined : onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>

    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button onClick={onCancel} disabled={isLoading} variant="outlined" color="inherit">
        Cancel
      </Button>

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        variant="contained"
        color={confirmColor}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
