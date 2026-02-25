import type React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardOutlinedIcon },
  { label: 'Bank Accounts', path: ROUTES.ACCOUNTS, icon: AccountBalanceWalletOutlinedIcon },
  { label: 'Transactions', path: ROUTES.TRANSACTIONS, icon: ReceiptLongOutlinedIcon },
  { label: 'Profile', path: ROUTES.PROFILE, icon: PersonOutlinedIcon },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Users', path: ROUTES.ADMIN_USERS, icon: GroupOutlinedIcon },
];

// ---------------------------------------------------------------------------
// NavItemRow — single navigation link
// ---------------------------------------------------------------------------

const NavItemRow = ({ item }: { item: NavItem }) => {
  const { pathname } = useLocation();
  const isActive =
    pathname === item.path || (item.path !== ROUTES.DASHBOARD && pathname.startsWith(item.path));

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
        <ListItemButton
          selected={isActive}
          sx={{
            mx: 1,
            borderRadius: 1,
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '& .MuiListItemIcon-root': { color: 'white' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <item.icon />
          </ListItemIcon>
          <ListItemText primary={<Typography variant="body_mediumBold">{item.label}</Typography>} />
        </ListItemButton>
      </Link>
    </ListItem>
  );
};

// ---------------------------------------------------------------------------
// SidebarContent — shared between permanent and temporary drawers
// ---------------------------------------------------------------------------

const SidebarContent = () => {
  const { data: currentUser } = useCurrentUser();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AccountBalanceOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="title_small" color="primary.main">
          BankingApp
        </Typography>
      </Box>

      <Divider />

      {/* Main navigation */}
      <List sx={{ px: 0.5, pt: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItemRow key={item.path} item={item} />
        ))}
      </List>

      {/* Admin section — only shown for role === 'admin' */}
      {currentUser?.role === 'admin' && (
        <>
          <Divider />
          <Typography
            variant="label_small"
            sx={{
              px: 3,
              pt: 1.5,
              pb: 0.5,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08rem',
            }}
          >
            Admin
          </Typography>
          <List sx={{ px: 0.5, pb: 1.5 }}>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavItemRow key={item.path} item={item} />
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Sidebar — responsive: permanent on desktop, temporary on mobile
// ---------------------------------------------------------------------------

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => (
  <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
    {/* Mobile: slides in as overlay */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <SidebarContent />
    </Drawer>

    {/* Desktop: always visible, flows in the flex layout */}
    <Drawer
      variant="permanent"
      open
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100vh',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  </Box>
);
