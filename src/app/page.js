'use client';
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('common');
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {t('greeting')}
        </Typography>
        <Typography variant="body1">
          This is the home page. We will build awesome features here!
        </Typography>
      </Box>
    </Container>
  );
}
