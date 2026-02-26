import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import { AccountCard } from '@/components/bank-accounts/AccountCard';
import { AccountFormModal } from '@/components/bank-accounts/AccountFormModal';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useIsAdmin } from '@/hooks/useCurrentUser';
import type { BankAccount } from '@/types/bank-account';

export const BankAccountsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);

  const isAdmin = useIsAdmin();

  const { data: response, isLoading } = useBankAccounts();
  const accounts = response?.data ?? [];

  return (
    <>
      <Stack spacing={3}>
        {/* Page header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="title_medium">Bank Accounts</Typography>
          {!isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Add Account
            </Button>
          )}
        </Stack>

        {/* Content */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : accounts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <Typography color="text.secondary" variant="body_mediumRegular">
              No bank accounts yet
            </Typography>
            {!isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Add your first account
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {accounts.map((acc) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
                <AccountCard
                  account={acc}
                  onEdit={!isAdmin ? () => setEditAccount(acc) : undefined}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {!isAdmin && (
        <>
          {/* Create modal */}
          <AccountFormModal open={createOpen} onClose={() => setCreateOpen(false)} />

          {/* Edit modal */}
          <AccountFormModal
            open={!!editAccount}
            onClose={() => setEditAccount(null)}
            account={editAccount ?? undefined}
          />
        </>
      )}
    </>
  );
};
