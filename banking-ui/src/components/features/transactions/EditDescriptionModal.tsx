import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { useUpdateTransactionDescription } from '@/hooks/useTransactions';
import type { Transaction } from '@/types/transaction';


interface EditDescriptionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EditDescriptionModal = ({ open, onClose, transaction }: EditDescriptionModalProps) => {
  const updateDescription = useUpdateTransactionDescription();

  const { register, handleSubmit, reset } = useForm<{ description: string }>({
    defaultValues: { description: '' },
  });

  useEffect(() => {
    if (open) reset({ description: transaction?.description ?? '' });
    else reset({ description: '' });
  }, [open, transaction, reset]);

  const onSubmit = async ({ description }: { description: string }) => {
    if (!transaction) return;
    await updateDescription.mutateAsync({ id: transaction.id, description });
    onClose();
  };

  const isPending = updateDescription.isPending;

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Description</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label="Description"
            multiline
            rows={3}
            {...register('description')}
            fullWidth
            autoFocus
            sx={{ mt: 0.5 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} disabled={isPending} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            variant="contained"
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
