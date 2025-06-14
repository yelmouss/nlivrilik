'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Box from '@mui/material/Box';
import { usePathname } from 'next/navigation';

export function Providers({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {!isAdminPage && <Navbar />}
          <Box component="main" sx={{ flexGrow: 1, }}>
            {children}
          </Box>
          {!isAdminPage && <Footer />}
        </Box>
      </ThemeProvider>
    </SessionProvider>
  );
}