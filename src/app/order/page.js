'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

// Composant de la carte OpenLayers
import OrderMap from '@/components/OrderMap';

// Délai pour la saisie automatique
const DEBOUNCE_DELAY = 300; // ms

export default function OrderPage() {
  const theme = useTheme();
  const t = useTranslations('Order');
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Références
  const orderContentRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  // États du formulaire
  const [activeStep, setActiveStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [additionalAddressInfo, setAdditionalAddressInfo] = useState('');
  const [orderContent, setOrderContent] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Étapes du formulaire
  const steps = [
    t('step1ContactInfo'),
    t('step2DeliveryAddress'),
    t('step3OrderDetails'),
    t('step4Confirmation')
  ];
  
  // Remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (status === 'authenticated' && session.user) {
      if (session.user.name) setFullName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [status, session]);
  
  // Fonction pour obtenir des suggestions basées sur le texte saisi
  const fetchSuggestions = async (text) => {
    if (!text || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    
    try {
      setLoadingSuggestions(true);
      const response = await fetch('/api/orders/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  
  // Fonction de debounce pour les suggestions
  const handleOrderContentChange = (e) => {
    const text = e.target.value;
    setOrderContent(text);
    
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Configurer un nouveau timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, DEBOUNCE_DELAY);
  };
  
  // Fonction pour ajouter une suggestion au contenu de la commande
  const addSuggestionToOrder = (suggestion) => {
    const newContent = orderContent ? `${orderContent}, ${suggestion}` : suggestion;
    setOrderContent(newContent);
    
    // Mettre le focus sur le champ de texte et positionner le curseur à la fin
    if (orderContentRef.current) {
      orderContentRef.current.focus();
      orderContentRef.current.setSelectionRange(newContent.length, newContent.length);
    }
    
    // Afficher un message de confirmation
    setSnackbarMessage(`${suggestion} ${t('addedToOrder')}`);
    setSnackbarOpen(true);
  };
  
  // Fonction pour mettre à jour les coordonnées depuis la carte
  const handleMapLocationSelect = (location) => {
    setCoordinates(location.coordinates);
    setAddress(location.formattedAddress);
  };
  
  // Gestion de la navigation entre les étapes
  const handleNext = () => {
    // Validation avant de passer à l'étape suivante
    if (activeStep === 0) {
      if (!fullName || !email || !phoneNumber) {
        setError(t('pleaseCompleteAllFields'));
        return;
      }
      // Validation simple de l'email
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError(t('invalidEmailFormat'));
        return;
      }
      // Validation simple du numéro de téléphone
      if (!/^\+?[0-9\s]{8,15}$/.test(phoneNumber.replace(/[\s()-]/g, ''))) {
        setError(t('invalidPhoneFormat'));
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!address || coordinates[0] === 0 && coordinates[1] === 0) {
        setError(t('pleaseSelectDeliveryAddress'));
        return;
      }
    }
    
    if (activeStep === 2) {
      if (!orderContent) {
        setError(t('pleaseEnterOrderDetails'));
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const orderData = {
        contactInfo: {
          fullName,
          email,
          phoneNumber
        },
        deliveryAddress: {
          formattedAddress: address,
          coordinates: {
            type: 'Point',
            coordinates
          },
          additionalInfo: additionalAddressInfo
        },
        orderContent
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // Redirection vers la page des commandes après 2 secondes
        setTimeout(() => {
          router.push('/my-orders');
        }, 2000);
      } else {
        setError(data.message || t('errorCreatingOrder'));
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setError(t('errorCreatingOrder'));
    } finally {
      setLoading(false);
    }
  };
  
  // Fermeture du snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Contenu de l'étape courante
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('contactInformation')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="fullName"
                  name="fullName"
                  label={t('fullName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  label={t('email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  name="phoneNumber"
                  label={t('phoneNumber')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('deliveryAddress')}
            </Typography>
            <Box sx={{ height: 400, mb: 3 }}>
              <OrderMap
                onLocationSelect={handleMapLocationSelect}
                initialCoordinates={coordinates}
              />
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="address"
                  name="address"
                  label={t('address')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="additionalAddressInfo"
                  name="additionalAddressInfo"
                  label={t('additionalAddressInfo')}
                  placeholder={t('additionalAddressInfoPlaceholder')}
                  value={additionalAddressInfo}
                  onChange={(e) => setAdditionalAddressInfo(e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('orderDetails')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('orderDetailsDescription')}
            </Typography>
            
            <TextField
              required
              fullWidth
              id="orderContent"
              name="orderContent"
              label={t('orderContent')}
              multiline
              rows={6}
              value={orderContent}
              onChange={handleOrderContentChange}
              placeholder={t('orderContentPlaceholder')}
              inputRef={orderContentRef}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                    <ShoppingBasketIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            {loadingSuggestions && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            
            {suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('suggestions')}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      onClick={() => addSuggestionToOrder(suggestion)}
                      color="primary"
                      variant="outlined"
                      icon={<AddShoppingCartIcon />}
                      clickable
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      case 3:
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
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('fullName')}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{fullName}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('email')}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">{email}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('phoneNumber')}:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
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
      default:
        return 'Unknown step';
    }
  };
  
  // Si la commande a été créée avec succès
  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <SentimentSatisfiedAltIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
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
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          {t('placeOrder')}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            {t('back')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              t('placeOrder')
            ) : (
              t('next')
            )}
          </Button>
        </Box>
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
