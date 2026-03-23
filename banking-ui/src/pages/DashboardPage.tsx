import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';

import { StatusChip } from '@/components/common/StatusChip';
import { CreateTransactionModal } from '@/components/features/transactions/CreateTransactionModal';
import { StatCard } from '@/components/widgets/StatCard';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useIsAdmin } from '@/hooks/useCurrentUser';
import { useTransactions } from '@/hooks/useTransactions';
import { colors } from '@/theme/colors';
import { formatTransactionAmount } from '@/utils/transaction';

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export const DashboardPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const isAdmin = useIsAdmin();

  const { data: accountsResponse, isLoading: accountsLoading } = useBankAccounts();
  const { data: txResponse, isLoading: txLoading } = useTransactions({
    limit: 5,
    orderBy: 'DESC',
  });

  const accounts = accountsResponse?.data ?? [];
  const recentTransactions = txResponse?.data ?? [];
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalTransactions = txResponse?.metadata?.totalCount ?? 0;

  // BarChart data derived from accounts
  const chartLabels = accounts.map((acc) => acc.name);
  const chartData = accounts.map((acc) => Number(acc.balance));

  return (
    <>
      <Stack spacing={3}>
        {/* Page header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="title_medium">Overview</Typography>
          {!isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
              New Transaction
            </Button>
          )}
        </Stack>

        {/* Stat cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Total Balance"
              value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              icon={<AccountBalanceIcon />}
              iconBg={colors.blue10}
              iconColor={colors.blue70}
              isLoading={accountsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Bank Accounts"
              value={String(accounts.length)}
              icon={<CreditCardIcon />}
              iconBg={colors.green10}
              iconColor={colors.green70}
              isLoading={accountsLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Total Transactions"
              value={String(totalTransactions)}
              icon={<ReceiptLongIcon />}
              iconBg={colors.yellow10}
              iconColor={colors.yellow70}
              isLoading={txLoading}
            />
          </Grid>
        </Grid>

        {/* Balance chart + Recent transactions */}
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {/* Balance by Account chart */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="body_largeBold" sx={{ mb: 2 }}>
                Balance by Account
              </Typography>

              {accountsLoading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />
              ) : accounts.length === 0 ? (
                <Box
                  sx={{
                    height: 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary" variant="body_mediumRegular">
                    No accounts yet
                  </Typography>
                </Box>
              ) : (
                <BarChart
                  xAxis={[{ scaleType: 'band', data: chartLabels }]}
                  series={[
                    {
                      data: chartData,
                      color: colors.blue60,
                      valueFormatter: (v) =>
                        v !== null
                          ? `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : '$0.00',
                    },
                  ]}
                  height={280}
                  margin={{ top: 16, bottom: 40, left: 70, right: 16 }}
                />
              )}
            </Paper>
          </Grid>

          {/* Recent transactions */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="body_largeBold" sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>

              {txLoading ? (
                <Stack spacing={1.5}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              ) : recentTransactions.length === 0 ? (
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary" variant="body_mediumRegular">
                    No transactions yet
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                  {recentTransactions.map((tx) => {
                    const { text, color } = formatTransactionAmount(tx);
                    return (
                      <Box key={tx.id} sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Stack sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body_mediumBold"
                              sx={{
                                textTransform: 'capitalize',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {tx.name}
                            </Typography>
                            <Typography variant="body_smallRegular" color="text.secondary">
                              {dayjs(tx.createdAt).format('MMM D, YYYY')}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                            <Typography variant="body_mediumBold" sx={{ color }}>
                              {text}
                            </Typography>
                            <StatusChip status={tx.status} />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      {!isAdmin && <CreateTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
};
