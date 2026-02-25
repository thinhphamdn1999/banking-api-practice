import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';

// Full implementation (Sidebar + Header) in Step 6
export const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
