import { useCallback } from 'react';
import { validateStep } from '@/utils/orderValidation';

export const useOrderStepNavigation = (
  activeStep,
  setActiveStep,
  setError,
  formData,
  t
) => {
  // Gestion de la navigation vers l'étape suivante
  const handleNext = useCallback(() => {
    // Validation avant de passer à l'étape suivante
    const validationError = validateStep(activeStep, formData, t);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [activeStep, formData, setActiveStep, setError, t]);

  // Gestion de la navigation vers l'étape précédente
  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, [setActiveStep]);

  return {
    handleNext,
    handleBack,
  };
};
