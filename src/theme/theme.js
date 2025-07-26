'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#EA9932',      // Couleur principale
      light: '#FFC884',     // Variante claire
      dark: '#C77712',      // Variante foncée
      contrastText: '#FFFBDE',
    },
    secondary: {
      main: '#FFDF84',      // Couleur secondaire principale
      light: '#FDD35A',     // Variante claire
      dark: '#C79812',      // Variante foncée
      contrastText: '#9E2A02',
    },
    background: {
      default: '#FFDF84',   // Jaune très clair
      paper: '#FFC884',     // Papier avec la couleur claire primaire
    },
    text: {
      primary: '#9E5902',   // Texte principal foncé
      secondary: '#FFA384', // Texte secondaire orangé
    },
    custom: {
      // Gamme Primary
      main: '#EA9932',
      light: '#FFC884',
      medium: '#FDB55A',
      dark: '#C77712',
      darkest: '#9E5902',
      // Gamme Secondary
      secMain: '#FFDF84',
      secLight: '#FDD35A',
      secMedium: '#EABA32',
      secDark: '#C79812',
      secDarkest: '#9E7502',
      // Accent
      accent: '#FFA384',
      accentMedium: '#FD845A',
      accentDark: '#EA6132',
      accentDarker: '#C74012',
      accentDarkest: '#9E2A02',
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#9E5902', // Texte principal avec la couleur la plus foncée
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#EA9932',
    },
    body1: {
      fontSize: '1rem',
      color: '#C77712', // Texte du corps avec une couleur medium foncée
    },
    button: {
      textTransform: 'none',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.custom.accentDarkest,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#EA9932',
          color: '#FFFBDE',
          '&:hover': {
            backgroundColor: '#C77712',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFDF84',
          color: '#9E5902',
          '&:hover': {
            backgroundColor: '#FDD35A',
          },
        },
        text: {
          color: '#9E2A02',
          '&:hover': {
            backgroundColor: 'rgba(255, 251, 222, 0.08)',
          }
        }
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => (
          (ownerState.color === undefined || ownerState.color === 'inherit') ? {
            color: theme.palette.custom.accentDarkest,
            '&:hover': {
              backgroundColor: 'rgba(234, 153, 50, 0.08)',
            }
          } : {}
        ),
      },
    },
  },
});

export default theme;
