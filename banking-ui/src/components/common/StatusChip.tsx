import Chip from '@mui/material/Chip';

import { colors } from '@/theme/colors';
import type { TransactionStatus } from '@/types/transaction';
import type { UserStatus } from '@/types/user';



export type StatusValue = TransactionStatus | UserStatus;

interface StatusConfig {
  label: string;
  bgcolor: string;
  color: string;
}

const STATUS_CONFIG: Record<StatusValue, StatusConfig> = {
  // Transaction statuses
  success: { label: 'Success', bgcolor: colors.green10, color: colors.green70 },
  pending: { label: 'Pending', bgcolor: colors.yellow10, color: colors.yellow70 },
  failed: { label: 'Failed', bgcolor: colors.red10, color: colors.red70 },

  // User statuses
  active: { label: 'Active', bgcolor: colors.green10, color: colors.green70 },
  'de-active': { label: 'Deactivated', bgcolor: colors.red10, color: colors.red70 },
  deleted: { label: 'Deleted', bgcolor: colors.neutral30, color: colors.neutral60 },
};

interface StatusChipProps {
  status: StatusValue;
}

export const StatusChip = ({ status }: StatusChipProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '6px',
        height: 24,
      }}
    />
  );
};
