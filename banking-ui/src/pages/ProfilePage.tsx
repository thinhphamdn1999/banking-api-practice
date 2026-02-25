import { UserProfile } from '@clerk/clerk-react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const ProfilePage = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="title_medium">Profile</Typography>

      <UserProfile
        appearance={{
          elements: {
            rootBox: { width: '100%' },
            card: { width: '100%', boxShadow: 'none', border: '1px solid', borderColor: 'divider' },
          },
        }}
      />
    </Stack>
  );
};
