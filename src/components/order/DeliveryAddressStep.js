'use client';

import { Box, Typography, Grid, TextField, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import OrderMap from '@/components/OrderMap';
import { useTranslations } from 'next-intl';

export default function DeliveryAddressStep({
  address,
  coordinates,
  additionalAddressInfo,
  onLocationSelect,
  onAdditionalInfoChange,
  onAddressChange,
}) {
  const t = useTranslations('Order');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('deliveryAddress')}
      </Typography>
      <Box sx={{ height: 400, mb: 3 }}>
        <OrderMap
          onLocationSelect={onLocationSelect}
          initialCoordinates={coordinates}
        />
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="address"
            name="address"
            label={t('address')}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
              readOnly: true,
            }}
            helperText={t('selectLocationOnMap')}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="additionalAddressInfo"
            name="additionalAddressInfo"
            label={t('additionalAddressInfo')}
            placeholder={t('additionalAddressInfoPlaceholder')}
            value={additionalAddressInfo}
            onChange={(e) => onAdditionalInfoChange(e.target.value)}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
