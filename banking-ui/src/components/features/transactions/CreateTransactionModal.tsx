import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useCreateTransaction } from '@/hooks/useTransactions';
import type { TransactionType } from '@/types/transaction';

const schema = z
  .object({
    type: z.enum(['deposit', 'withdraw', 'transfer']),
    amount: z
      .number({ error: 'Please enter a valid amount' })
      .positive('Amount must be greater than 0'),
    fromAccountId: z.string().optional(),
    toAccountId: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'withdraw' || data.type === 'transfer') {
      if (!data.fromAccountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['fromAccountId'],
          message: 'Please select a source account',
        });
      }
    }
    if (data.type === 'deposit' || data.type === 'transfer') {
      if (!data.toAccountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['toAccountId'],
          message: 'Please select a destination account',
        });
      }
    }
    if (
      data.type === 'transfer' &&
      data.fromAccountId &&
      data.toAccountId &&
      data.fromAccountId === data.toAccountId
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['toAccountId'],
        message: 'Source and destination must be different accounts',
      });
    }
  });

type FormValues = z.infer<typeof schema>;


interface CreateTransactionModalProps {
  open: boolean;
  onClose: () => void;
}



export const CreateTransactionModal = ({ open, onClose }: CreateTransactionModalProps) => {
  const { data: accountsResponse } = useBankAccounts();
  const accounts = accountsResponse?.data ?? [];

  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const createTransaction = useCreateTransaction();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'deposit' },
  });

  const type = useWatch({ control, name: 'type' });

  // Reset the form whenever the dialog closes
  useEffect(() => {
    if (!open) reset({ type: 'deposit' });
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    await createTransaction.mutateAsync({
      type: values.type as TransactionType,
      amount: { amount: values.amount, currency: 'USD' },
      idempotencyKey: idempotencyKey,
      sourceAccountId: values.fromAccountId || undefined,
      destinationAccountId: values.toAccountId || undefined,
      description: values.description || undefined,
    });
    setIdempotencyKey(crypto.randomUUID());
    onClose();
  };

  const isPending = createTransaction.isPending;

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Transaction</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {/* Transaction type */}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Transaction Type"
                  {...field}
                  error={!!errors.type}
                  helperText={errors.type?.message}
                  fullWidth
                >
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="withdraw">Withdraw</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </TextField>
              )}
            />

            {/* From account — withdraw & transfer only */}
            {(type === 'withdraw' || type === 'transfer') && (
              <Controller
                name="fromAccountId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="From Account"
                    {...field}
                    value={field.value ?? ''}
                    error={!!errors.fromAccountId}
                    helperText={errors.fromAccountId?.message}
                    fullWidth
                  >
                    {accounts.map((acc) => (
                      <MenuItem key={acc.id} value={acc.id}>
                        {acc.name} — $
                        {Number(acc.balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {/* To account — deposit & transfer only */}
            {(type === 'deposit' || type === 'transfer') && (
              <Controller
                name="toAccountId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="To Account"
                    {...field}
                    value={field.value ?? ''}
                    error={!!errors.toAccountId}
                    helperText={errors.toAccountId?.message}
                    fullWidth
                  >
                    {accounts.map((acc) => (
                      <MenuItem key={acc.id} value={acc.id}>
                        {acc.name} — $
                        {Number(acc.balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {/* Amount */}
            <TextField
              label="Amount ($)"
              type="number"
              slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              {...register('amount', { valueAsNumber: true })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              fullWidth
            />

            {/* Description */}
            <TextField
              label="Description (optional)"
              multiline
              rows={2}
              {...register('description')}
              fullWidth
            />
          </Stack>
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
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
