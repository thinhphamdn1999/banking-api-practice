import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/Block';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';

import { AccountCard } from '@/components/features/bank-accounts/AccountCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusChip } from '@/components/common/StatusChip';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ROUTES } from '@/constants/routes';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useDeactivateUser, useUserById } from '@/hooks/useUsers';
import { transactionsService } from '@/services/transactions.service';
import type { Transaction } from '@/types/transaction';
import type { User } from '@/types/user';
import { formatTransactionAmount } from '@/utils/transaction';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getDisplayName = (user: User) => {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.username || user.email || '—';
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const AdminUserDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [txPaginationModel, setTxPaginationModel] = useState({ page: 0, pageSize: 10 });

  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------
  const { data: userResponse, isLoading: userLoading } = useUserById(id);
  const user = userResponse?.data;

  const { data: accountsResponse, isLoading: accountsLoading } = useBankAccounts({ userId: id });
  const accounts = accountsResponse?.data ?? [];
  const bankAccountIds = accounts.map((a) => a.id);

  const { data: txResponse, isLoading: txLoading } = useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, { bankAccountIds, ...txPaginationModel }],
    queryFn: () =>
      transactionsService.getAll({
        bankAccountIds,
        page: txPaginationModel.page + 1,
        limit: txPaginationModel.pageSize,
        orderBy: 'DESC',
      }),
    enabled: !accountsLoading && bankAccountIds.length > 0,
  });
  const transactions = txResponse?.data ?? [];
  const txTotal = txResponse?.metadata?.totalCount ?? 0;

  // -------------------------------------------------------------------------
  // Deactivate
  // -------------------------------------------------------------------------
  const deactivate = useDeactivateUser();

  const handleDeactivateConfirm = async () => {
    if (!user) return;
    await deactivate.mutateAsync(user.id);
    setConfirmOpen(false);
  };

  const canDeactivate = user?.status === 'active' && user.clerkUserId !== clerkUser?.id;

  // -------------------------------------------------------------------------
  // Transaction columns
  // -------------------------------------------------------------------------
  const txColumns = useMemo<GridColDef<Transaction>[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 120,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular">
            {dayjs(row.createdAt).format('MMM D, YYYY')}
          </Typography>
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 160,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular" sx={{ textTransform: 'capitalize' }}>
            {row.name}
          </Typography>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        renderCell: ({ row }) => (
          <Chip
            label={row.type.charAt(0).toUpperCase() + row.type.slice(1)}
            size="small"
            sx={{ height: 24, borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}
          />
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 120,
        renderCell: ({ row }) => {
          const { text, color } = formatTransactionAmount(row);
          return (
            <Typography variant="body_smallRegular" sx={{ color }}>
              {text}
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 110,
        renderCell: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: 'fromAccount',
        headerName: 'From',
        width: 150,
        renderCell: ({ row }) => (
          <Typography
            variant="body_smallRegular"
            color={row.fromAccount ? 'text.primary' : 'text.disabled'}
          >
            {row.fromAccount ? `•••• ${row.fromAccount.accountNumber.slice(-4)}` : '—'}
          </Typography>
        ),
      },
      {
        field: 'toAccount',
        headerName: 'To',
        width: 150,
        renderCell: ({ row }) => (
          <Typography
            variant="body_smallRegular"
            color={row.toAccount ? 'text.primary' : 'text.disabled'}
          >
            {row.toAccount ? `•••• ${row.toAccount.accountNumber.slice(-4)}` : '—'}
          </Typography>
        ),
      },
    ],
    [],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => navigate(ROUTES.ADMIN_USERS)} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="title_medium">
            {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
          </Typography>
        </Stack>

        {/* User info card */}
        {userLoading ? (
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Skeleton variant="circular" width={80} height={80} />
              <Stack spacing={1} flex={1}>
                <Skeleton width={200} height={28} />
                <Skeleton width={160} />
                <Skeleton width={120} />
              </Stack>
            </Stack>
          </Paper>
        ) : user ? (
          <Paper sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
              <Avatar
                src={user.avatarUrl ?? undefined}
                alt={getDisplayName(user)}
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {getDisplayName(user).charAt(0).toUpperCase()}
              </Avatar>

              <Stack spacing={1} flex={1}>
                <Typography variant="body_largeBold">{getDisplayName(user)}</Typography>

                {user.email && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body_smallRegular" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body_smallRegular" color="text.secondary">
                    Joined {dayjs(user.createdAt).format('MMM D, YYYY')}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
                  {user.role === 'admin' ? (
                    <Chip
                      label="Admin"
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24, borderRadius: '6px' }}
                    />
                  ) : (
                    <Chip
                      label="User"
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24, borderRadius: '6px' }}
                    />
                  )}
                  <StatusChip status={user.status} />
                </Stack>
              </Stack>

              {canDeactivate && (
                <Tooltip title="Deactivate user">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Deactivate
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Paper>
        ) : null}

        {/* Bank Accounts */}
        <Stack spacing={2}>
          <Typography variant="body_largeBold">Bank Accounts</Typography>

          {accountsLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : accounts.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body_mediumRegular">
                No bank accounts
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {accounts.map((acc) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
                  <AccountCard account={acc} />
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>

        {/* Transactions */}
        <Stack spacing={2}>
          <Typography variant="body_largeBold">Transactions</Typography>

          {!accountsLoading && accounts.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body_mediumRegular">
                No transactions
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <DataGrid
                rows={transactions}
                columns={txColumns}
                rowCount={txTotal}
                loading={txLoading || accountsLoading}
                paginationMode="server"
                paginationModel={txPaginationModel}
                onPaginationModelChange={setTxPaginationModel}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiDataGrid-cell': { alignItems: 'center' },
                }}
              />
            </Box>
          )}
        </Stack>
      </Stack>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate User"
        description={
          user
            ? `Are you sure you want to deactivate "${getDisplayName(user)}"? They will lose access to the platform.`
            : ''
        }
        confirmLabel="Deactivate"
        confirmColor="error"
        isLoading={deactivate.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
