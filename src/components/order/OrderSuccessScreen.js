'use client';

import { Container, Paper, Typography, CircularProgress } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { useTranslations } from 'next-intl';

export default function OrderSuccessScreen() {
  const t = useTranslations('Order');

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <SentimentSatisfiedAltIcon
          sx={{ fontSize: 60, color: 'success.main', mb: 2 }}
        />
        <Typography variant="h4" gutterBottom>
          {t('orderSuccessTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('orderSuccessMessage')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('redirectingToOrders')}
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Paper>
    </Container>
  );
}
