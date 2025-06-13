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
      main: '#129990', // Vert sarcelle moyen
    },
    secondary: {
      main: '#90D1CA', // Vert sarcelle clair
    },
    background: {
      default: '#FFFBDE', // Jaune très clair
      paper: '#FFFBDE', 
    },
    text: {
      primary: '#096B68', // Vert sarcelle foncé
      secondary: '#129990', // Vert sarcelle moyen
    },
    custom: {
      darkTeal: '#096B68',
      mediumTeal: '#129990',
      lightTeal: '#90D1CA',
      lightYellow: '#FFFBDE',
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#096B68', // Texte principal avec la couleur la plus foncée
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#096B68',
    },
    body1: {
      fontSize: '1rem',
      color: '#129990', // Texte du corps avec une couleur sarcelle moyenne
    },
    button: {
      textTransform: 'none',
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main, // AppBar avec le vert sarcelle clair
          color: theme.palette.custom.darkTeal, // Texte foncé pour contraster avec le fond clair
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#129990',
          color: '#FFFBDE',
          '&:hover': {
            backgroundColor: '#096B68',
          },
        },
        containedSecondary: {
          backgroundColor: '#90D1CA',
          color: '#096B68',
          '&:hover': {
            backgroundColor: '#7ABFB8', // Nuance plus claire de #90D1CA pour le survol
          },
        },
        // Style pour les boutons de navigation texte dans l'AppBar
        text: {
          color: '#FFFBDE', // Couleur du texte des boutons dans l'AppBar
          '&:hover': {
            backgroundColor: 'rgba(255, 251, 222, 0.08)', // Léger surlignage jaune clair
          }
        }
      },
    },
    // Assurer que les IconButton dans l'AppBar utilisent aussi la bonne couleur
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          // Appliquer la couleur uniquement si l'IconButton est un descendant direct ou indirect d'AppBar
          // ou si une couleur spécifique n'est pas déjà définie par `color` prop
          ...(ownerState.color === undefined || ownerState.color === 'inherit' ? {
            color: theme.palette.custom.darkTeal, // Texte foncé pour contraster
            '&:hover': {
              backgroundColor: 'rgba(9, 107, 104, 0.08)', // Léger surlignage sarcelle foncé
            }
          } : {})
        }),
      },
    },
  },
});

export default theme;
