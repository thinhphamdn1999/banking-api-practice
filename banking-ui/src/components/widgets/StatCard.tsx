import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}

export const StatCard = ({ title, value, icon, iconBg, iconColor, isLoading }: StatCardProps) => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          bgcolor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body_smallRegular" color="text.secondary">
          {title}
        </Typography>
        {isLoading ? (
          <Skeleton width={100} height={32} />
        ) : (
          <Typography variant="title_small">{value}</Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);
