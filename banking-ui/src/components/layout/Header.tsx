import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { UserButton } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Page title map — derived from the current route pathname
// ---------------------------------------------------------------------------

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.ACCOUNTS]: 'Bank Accounts',
  [ROUTES.TRANSACTIONS]: 'Transactions',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.ADMIN_USERS]: 'Users',
};

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/admin/users/')) return 'User Detail';
  return PAGE_TITLES[pathname] ?? 'Banking App';
};

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

interface HeaderProps {
  onMenuOpen: () => void;
}

export const Header = ({ onMenuOpen }: HeaderProps) => {
  const { pathname } = useLocation();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Hamburger — mobile only */}
        <IconButton
          onClick={onMenuOpen}
          edge="start"
          sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="title_small" sx={{ flexGrow: 1, color: 'text.primary' }}>
          {getPageTitle(pathname)}
        </Typography>

        {/* Clerk UserButton: avatar, sign-out, profile link */}
        <UserButton />
      </Toolbar>
    </AppBar>
  );
};
