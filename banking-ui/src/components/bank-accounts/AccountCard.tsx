import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import dayjs from 'dayjs';

import { ROUTES } from '@/constants/routes';
import { colors } from '@/theme/colors';
import type { BankAccount } from '@/types/bank-account';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AccountCardProps {
  account: BankAccount;
  onEdit?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AccountCard = ({ account, onEdit }: AccountCardProps) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header: icon + edit button */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: colors.blue10,
            color: colors.blue70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AccountBalanceIcon />
        </Box>
        {onEdit && (
          <IconButton size="small" onClick={onEdit} aria-label="edit account">
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {/* Account name */}
      <Typography variant="body_largeBold" sx={{ mb: 0.5 }}>
        {account.name}
      </Typography>

      {/* Masked account number */}
      <Typography variant="body_smallRegular" color="text.secondary" sx={{ mb: 2 }}>
        •••• {account.accountNumber.slice(-4)}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Balance */}
      <Typography variant="body_smallRegular" color="text.secondary">
        Balance
      </Typography>
      <Typography variant="title_small" sx={{ mb: 'auto', pb: 2 }}>
        ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Typography>

      {/* Footer */}
      <Typography variant="body_smallRegular" color="text.secondary" sx={{ mb: 1.5 }}>
        Created {dayjs(account.createdAt).format('MMM D, YYYY')}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ReceiptLongIcon />}
        onClick={() => navigate(`${ROUTES.TRANSACTIONS}?accountId=${account.id}`)}
        fullWidth
      >
        View Transactions
      </Button>
    </Paper>
  );
};
