'use client';

import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function OrderSummaryStep({
  fullName,
  email,
  phoneNumber,
  address,
  additionalAddressInfo,
  orderContent,
}) {
  const t = useTranslations('Order');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('orderSummary')}
      </Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('contactInformation')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('fullName')}:
            </Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Typography variant="body2">{fullName}</Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('email')}:
            </Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Typography variant="body2">{email}</Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('phoneNumber')}:
            </Typography>
          </Grid>
          <Grid size={{ xs: 8 }}>
            <Typography variant="body2">{phoneNumber}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('deliveryAddress')}
        </Typography>
        <Typography variant="body2" paragraph>
          {address}
        </Typography>
        {additionalAddressInfo && (
          <>
            <Typography variant="body2" color="text.secondary">
              {t('additionalInfo')}:
            </Typography>
            <Typography variant="body2">
              {additionalAddressInfo}
            </Typography>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('orderContent')}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {orderContent}
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        {t('orderConfirmationDescription')}
      </Typography>
    </Box>
  );
}
