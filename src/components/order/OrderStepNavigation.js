'use client';

import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function OrderStepNavigation({
  activeStep,
  totalSteps,
  loading,
  onBack,
  onNext,
  onSubmit,
}) {
  const t = useTranslations('Order');
  const isLastStep = activeStep === totalSteps - 1;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button
        disabled={activeStep === 0}
        onClick={onBack}
        variant="outlined"
      >
        {t('back')}
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={isLastStep ? onSubmit : onNext}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : isLastStep ? (
          t('placeOrder')
        ) : (
          t('next')
        )}
      </Button>
    </Box>
  );
}
