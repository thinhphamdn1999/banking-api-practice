import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { createTypographyVariants } from './typography';

const baseTheme = createTheme();

const theme = createTheme({
  palette: {
    primary: {
      light: colors.blue60,
      main: colors.blue70,
      dark: colors.blue80,
      contrastText: colors.white,
    },
    secondary: {
      light: colors.green60,
      main: colors.green70,
      dark: colors.green80,
      contrastText: colors.white,
    },
    error: {
      light: colors.red40,
      main: colors.red70,
      dark: colors.red80,
    },
    warning: {
      light: colors.yellow50,
      main: colors.yellow70,
      dark: colors.yellow80,
    },
    success: {
      light: colors.green40,
      main: colors.green70,
      dark: colors.green80,
    },
    background: {
      default: colors.neutral20,
      paper: colors.white,
    },
    text: {
      primary: colors.neutral90,
      secondary: colors.neutral60,
      disabled: colors.neutral50,
    },
    divider: colors.neutral30,
  },

  typography: {
    fontFamily: 'Roboto, sans-serif',
    ...createTypographyVariants(baseTheme.breakpoints),
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: colors.neutral20,
        },
      },
    },
  },
});

export default theme;
