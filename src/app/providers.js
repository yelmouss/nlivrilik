'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </SessionProvider>
  );
}