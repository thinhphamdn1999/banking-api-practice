import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { StatusChip } from '@/components/common/StatusChip';
import { CreateTransactionModal } from '@/components/features/transactions/CreateTransactionModal';
import { EditDescriptionModal } from '@/components/features/transactions/EditDescriptionModal';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useIsAdmin } from '@/hooks/useCurrentUser';
import { useTransactions } from '@/hooks/useTransactions';
import { formatTransactionAmount } from '@/utils/transaction';
import type { Transaction, TransactionStatus, TransactionType } from '@/types/transaction';

export const TransactionsPage = () => {
  const [searchParams] = useSearchParams();

  const isAdmin = useIsAdmin();

  // -------------------------------------------------------------------------
  // Filter state — accountIds can be pre-populated from URL ?accountId=...
  // -------------------------------------------------------------------------
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const initAccountId = searchParams.get('accountId');
  const [accountIds, setAccountIds] = useState<string[]>(initAccountId ? [initAccountId] : []);

  // -------------------------------------------------------------------------
  // Pagination (0-indexed for DataGrid, 1-indexed for the API)
  // -------------------------------------------------------------------------
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // -------------------------------------------------------------------------
  // Modal state
  // -------------------------------------------------------------------------
  const [createOpen, setCreateOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------
  const { data: accountsResponse } = useBankAccounts();
  const accounts = accountsResponse?.data ?? [];

  const queryParams = {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    orderBy: 'DESC' as const,
    ...(typeFilter && { type: typeFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(fromDate && { fromDate: fromDate.startOf('day').toISOString() }),
    ...(toDate && { toDate: toDate.endOf('day').toISOString() }),
    ...(accountIds.length > 0 && { bankAccountIds: accountIds }),
  };

  const { data: txResponse, isLoading } = useTransactions(queryParams);
  const rows = txResponse?.data ?? [];
  const rowCount = txResponse?.metadata?.totalCount ?? 0;

  // -------------------------------------------------------------------------
  // Filter helpers
  // -------------------------------------------------------------------------
  const resetPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const hasActiveFilters = !!(
    typeFilter ||
    statusFilter ||
    fromDate ||
    toDate ||
    accountIds.length
  );

  const clearFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setFromDate(null);
    setToDate(null);
    setAccountIds([]);
    resetPage();
  };

  // -------------------------------------------------------------------------
  // DataGrid columns
  // -------------------------------------------------------------------------
  const columns = useMemo<GridColDef<Transaction>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 160,
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 110,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular" sx={{ textTransform: 'capitalize' }}>
            {row.type}
          </Typography>
        ),
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 130,
        renderCell: ({ row }) => {
          const { text, color } = formatTransactionAmount(row);
          return (
            <Typography variant="body_mediumBold" sx={{ color }}>
              {text}
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: 'fromAccount',
        headerName: 'From',
        width: 150,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular">{row.fromAccount?.name ?? '—'}</Typography>
        ),
      },
      {
        field: 'toAccount',
        headerName: 'To',
        width: 150,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular">{row.toAccount?.name ?? '—'}</Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1,
        minWidth: 140,
        renderCell: ({ row }) => (
          <Typography
            variant="body_smallRegular"
            color={row.description ? 'text.primary' : 'text.disabled'}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {row.description ?? 'No description'}
          </Typography>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Date',
        width: 130,
        renderCell: ({ row }) => (
          <Typography variant="body_smallRegular">
            {dayjs(row.createdAt).format('MMM D, YYYY')}
          </Typography>
        ),
      },
      ...(!isAdmin
        ? [
            {
              field: 'edit',
              headerName: '',
              width: 52,
              sortable: false,
              renderCell: ({ row }: { row: Transaction }) => (
                <IconButton
                  size="small"
                  onClick={() => setEditTx(row)}
                  aria-label="edit description"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              ),
            } satisfies GridColDef<Transaction>,
          ]
        : []),
    ],
    [isAdmin],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <Stack spacing={3}>
        {/* Page header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="title_medium">Transactions</Typography>
          {!isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              New Transaction
            </Button>
          )}
        </Stack>

        {/* Filter bar */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
            {/* Account — multiple selection */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Accounts</InputLabel>
              <Select
                multiple
                value={accountIds}
                label="Accounts"
                onChange={(e) => {
                  setAccountIds(e.target.value as string[]);
                  resetPage();
                }}
                renderValue={(selected) => {
                  if (selected.length === 0) return 'All Accounts';
                  if (selected.length === 1) {
                    return accounts.find((a) => a.id === selected[0])?.name ?? selected[0];
                  }
                  return `${selected.length} accounts`;
                }}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    <Checkbox checked={accountIds.includes(acc.id)} size="small" />
                    <ListItemText primary={acc.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Type */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value as TransactionType | '');
                  resetPage();
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdraw">Withdraw</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value as TransactionStatus | '');
                  resetPage();
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>

            {/* From date */}
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(date) => {
                setFromDate(date);
                resetPage();
              }}
              slotProps={{ textField: { size: 'small' } }}
            />

            {/* To date */}
            <DatePicker
              label="To"
              value={toDate}
              onChange={(date) => {
                setToDate(date);
                resetPage();
              }}
              slotProps={{ textField: { size: 'small' } }}
            />

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                startIcon={<FilterListOffIcon />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Paper>

        {/* DataGrid */}
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowCount}
            loading={isLoading}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
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
      </Stack>

      {!isAdmin && (
        <>
          <CreateTransactionModal open={createOpen} onClose={() => setCreateOpen(false)} />
          <EditDescriptionModal
            open={!!editTx}
            onClose={() => setEditTx(null)}
            transaction={editTx}
          />
        </>
      )}
    </>
  );
};
