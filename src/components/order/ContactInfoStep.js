'use client';

import { Box, Typography, Grid, TextField, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTranslations } from 'next-intl';

export default function ContactInfoStep({
  fullName,
  email,
  phoneNumber,
  onFullNameChange,
  onEmailChange,
  onPhoneNumberChange,
}) {
  const t = useTranslations('Order');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('contactInformation')}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="fullName"
            name="fullName"
            label={t('fullName')}
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="phoneNumber"
            name="phoneNumber"
            label={t('phoneNumber')}
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="+1234567890"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
