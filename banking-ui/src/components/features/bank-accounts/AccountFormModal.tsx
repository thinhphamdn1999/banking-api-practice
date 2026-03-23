import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import { useCreateBankAccount, useUpdateBankAccount } from '@/hooks/useBankAccounts';
import type { BankAccount } from '@/types/bank-account';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Name must be 100 characters or less'),
});

type FormValues = z.infer<typeof schema>;


interface AccountFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Provide an account to activate edit mode; omit for create mode. */
  account?: BankAccount;
}



export const AccountFormModal = ({ open, onClose, account }: AccountFormModalProps) => {
  const isEdit = !!account;
  const createAccount = useCreateBankAccount();
  const updateAccount = useUpdateBankAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  // Sync form values when modal opens or the target account changes
  useEffect(() => {
    if (open) reset({ name: account?.name ?? '' });
    else reset({ name: '' });
  }, [open, account, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEdit) {
      await updateAccount.mutateAsync({ id: account.id, name: values.name });
    } else {
      await createAccount.mutateAsync({ name: values.name });
    }
    onClose();
  };

  const isPending = isEdit ? updateAccount.isPending : createAccount.isPending;

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Account' : 'New Account'}</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label="Account Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
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
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
