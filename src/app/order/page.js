"use client";

import { 
  Container, 
  Typography, 
  Paper, 
  Alert, 
  Snackbar, 
  Divider, 
  Stepper, 
  Step, 
  StepLabel,
  Box,
  useTheme,
  useMediaQuery 
} from "@mui/material";
import { useTranslations } from 'next-intl';

// Hooks personnalisés
import { useOrderForm } from "@/hooks/useOrderForm";
import { useOrderStepNavigation } from "@/hooks/useOrderStepNavigation";

// Composants de formulaire
import ContactInfoStep from "@/components/order/ContactInfoStep";
import DeliveryAddressStep from "@/components/order/DeliveryAddressStep";
import OrderDetailsStep from "@/components/order/OrderDetailsStep";
import OrderSummaryStep from "@/components/order/OrderSummaryStep";
import OrderSuccessScreen from "@/components/order/OrderSuccessScreen";
import OrderStepNavigation from "@/components/order/OrderStepNavigation";

// Autres composants
import LottieCarousel from "@/components/LottieCarousel";

export default function OrderPage() {
  const t = useTranslations("Order");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Utiliser le hook personnalisé pour la gestion du formulaire
  const {
    // État
    activeStep,
    fullName,
    email,
    phoneNumber,
    address,
    coordinates,
    additionalAddressInfo,
    orderContent,
    suggestions,
    loading,
    error,
    success,
    snackbarOpen,
    snackbarMessage,
    loadingSuggestions,
    steps,
    orderContentRef,

    // Setters
    setActiveStep,
    setFullName,
    setEmail,
    setPhoneNumber,
    setAdditionalAddressInfo,
    setError,

    // Handlers
    handleOrderContentChange,
    addSuggestionToOrder,
    handleMapLocationSelect,
    handleSubmit,
    handleSnackbarClose,
  } = useOrderForm();

  // Données du formulaire pour la validation
  const formData = {
    fullName,
    email,
    phoneNumber,
    address,
    coordinates,
    orderContent,
  };
  // Hook pour la navigation entre les étapes avec validation
  const { handleNext, handleBack } = useOrderStepNavigation(
    activeStep,
    setActiveStep,
    setError,
    formData,
    t
  );

  // Fonction pour obtenir le contenu de l'étape courante
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ContactInfoStep
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            onFullNameChange={setFullName}
            onEmailChange={setEmail}
            onPhoneNumberChange={setPhoneNumber}
          />
        );
      case 1:
        return (
          <DeliveryAddressStep
            address={address}
            coordinates={coordinates}
            additionalAddressInfo={additionalAddressInfo}
            onLocationSelect={handleMapLocationSelect}
            onAdditionalInfoChange={setAdditionalAddressInfo}
            onAddressChange={() => {}} // Read-only, géré par la carte
          />
        );
      case 2:
        return (
          <OrderDetailsStep
            orderContent={orderContent}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            orderContentRef={orderContentRef}
            onOrderContentChange={handleOrderContentChange}
            onAddSuggestion={addSuggestionToOrder}
          />
        );
      case 3:
        return (
          <OrderSummaryStep
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            address={address}
            additionalAddressInfo={additionalAddressInfo}
            orderContent={orderContent}
          />
        );
      default:
        return "Unknown step";
    }
  };

  // Si la commande a été créée avec succès
  if (success) {
    return <OrderSuccessScreen />;
  }
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>        <Typography variant="h4" gutterBottom textAlign="center">
          {t("placeOrder")}
        </Typography>

        <Divider />
        <Box sx={{ p: 2 }}>
          <LottieCarousel />
        </Box>        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 4 }}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}

        <OrderStepNavigation
          activeStep={activeStep}
          totalSteps={steps.length}
          loading={loading}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
}
