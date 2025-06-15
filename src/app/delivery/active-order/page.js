'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Stack,
  InputAdornment,
  FormControlLabel,
  Switch,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  Email,
  Schedule,
  AttachMoney,
  LocalShipping,
  CheckCircle,
  Edit,
  Payment,
  Star
} from '@mui/icons-material';
import OrderStatus from '@/models/OrderStatus';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return 'info';
    case OrderStatus.IN_TRANSIT:
      return 'warning';
    case OrderStatus.DELIVERED:
      return 'success';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return 'Confirmée';
    case OrderStatus.IN_TRANSIT:
      return 'En livraison';
    case OrderStatus.DELIVERED:
      return 'Livrée';
    default:
      return status;
  }
};

const deliverySteps = [
  { key: OrderStatus.CONFIRMED, label: 'Commande assignée' },
  { key: OrderStatus.IN_TRANSIT, label: 'En livraison' },
  { key: OrderStatus.DELIVERED, label: 'Livrée' }
];

export default function ActiveOrderPage() {
  const { data: session, status } = useSession();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    subtotal: '',
    deliveryFee: '',
    paymentMethod: 'cash',
    isPaid: false,
    deliveryNotes: ''
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "DELIVERY_MAN") {
      fetchActiveOrder();
    }
  }, [status, session]);

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/delivery/active-order');
      
      if (!response.ok) {
        if (response.status === 404) {
          setActiveOrder(null);
          return;
        }
        throw new Error('Erreur lors de la récupération de la commande active');
      }

      const data = await response.json();
      
      if (data.success) {
        setActiveOrder(data.order);
        // Initialize form data with current order data
        setUpdateFormData({
          status: data.order.status,
          subtotal: data.order.financialDetails?.subtotal || '',
          deliveryFee: data.order.financialDetails?.deliveryFee || '',
          paymentMethod: data.order.financialDetails?.paymentMethod || 'cash',
          isPaid: data.order.financialDetails?.isPaid || false,
          deliveryNotes: data.order.deliveryDetails?.deliveryNotes || ''
        });
      } else {
        setError(data.message || 'Erreur lors de la récupération de la commande active');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setActionLoading(true);

      // Calculate total
      const subtotal = parseFloat(updateFormData.subtotal) || 0;
      const deliveryFee = parseFloat(updateFormData.deliveryFee) || 0;
      const total = subtotal + deliveryFee;

      const response = await fetch('/api/delivery/update-order', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: activeOrder._id,
          status: updateFormData.status,
          financialDetails: {
            subtotal,
            deliveryFee,
            total,
            paymentMethod: updateFormData.paymentMethod,
            isPaid: updateFormData.isPaid
          },
          deliveryNotes: updateFormData.deliveryNotes
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: 'Commande mise à jour avec succès !',
          severity: 'success'
        });
        setUpdateDialogOpen(false);
        fetchActiveOrder(); // Refresh the order
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Erreur lors de la mise à jour',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setUpdateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getCurrentStepIndex = () => {
    return deliverySteps.findIndex(step => step.key === activeOrder?.status);
  };

  if (status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Ma Commande Active
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Gérez votre commande en cours de livraison.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!activeOrder ? (
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune commande active
                  </Typography>                  <Typography variant="body2" color="text.secondary">
                    Vous n&apos;avez pas de commande en cours de livraison.
                  </Typography>
                </Box>
              </CardContent>
            </Card>          ) : (            <Grid container spacing={3}>
              {/* Order Progress */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Progression de la livraison
                  </Typography>
                  <Stepper activeStep={getCurrentStepIndex()} alternativeLabel>
                    {deliverySteps.map((step) => (
                      <Step key={step.key}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              </Grid>

              {/* Order Details */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6">
                        Commande #{activeOrder._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Chip
                        label={getStatusLabel(activeOrder.status)}
                        color={getStatusColor(activeOrder.status)}
                      />
                    </Box>

                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Informations client
                        </Typography>                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person sx={{ fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Nom complet
                                </Typography>
                                <Typography variant="body1">
                                  {activeOrder.contactInfo?.fullName}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Phone sx={{ fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Téléphone
                                </Typography>
                                <Typography variant="body1">
                                  {activeOrder.contactInfo?.phoneNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Email sx={{ fontSize: 20 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Email
                                </Typography>
                                <Typography variant="body1">
                                  {activeOrder.contactInfo?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Adresse de livraison
                        </Typography>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <LocationOn sx={{ fontSize: 20, mt: 0.5 }} />
                          <Box>
                            <Typography variant="body1">
                              {activeOrder.deliveryAddress?.formattedAddress}
                            </Typography>
                            {activeOrder.deliveryAddress?.additionalInfo && (
                              <Typography variant="body2" color="text.secondary">
                                {activeOrder.deliveryAddress.additionalInfo}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Contenu de la commande
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          backgroundColor: 'grey.100', 
                          p: 2, 
                          borderRadius: 1,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {activeOrder.orderContent}
                        </Typography>
                      </Box>

                      {activeOrder.deliveryDetails?.deliveryNotes && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              Notes de livraison
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              backgroundColor: 'info.light', 
                              color: 'info.contrastText',
                              p: 2, 
                              borderRadius: 1
                            }}>
                              {activeOrder.deliveryDetails.deliveryNotes}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>              {/* Financial Details & Actions */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={2}>
                  {/* Financial Details */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Détails financiers
                      </Typography>
                      
                      {activeOrder.financialDetails?.subtotal ? (
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Sous-total:</Typography>
                            <Typography variant="body2">
                              {activeOrder.financialDetails.subtotal.toFixed(2)} MAD
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Frais de livraison:</Typography>
                            <Typography variant="body2">
                              {activeOrder.financialDetails.deliveryFee.toFixed(2)} MAD
                            </Typography>
                          </Box>
                          <Divider />
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body1" fontWeight="bold">Total:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {activeOrder.financialDetails.total.toFixed(2)} MAD
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Méthode:</Typography>
                            <Chip 
                              label={activeOrder.financialDetails.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}
                              size="small"
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Statut:</Typography>
                            <Chip 
                              label={activeOrder.financialDetails.isPaid ? 'Payé' : 'Non payé'}
                              color={activeOrder.financialDetails.isPaid ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Détails financiers à remplir lors de la livraison
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<Edit />}
                          onClick={() => setUpdateDialogOpen(true)}
                          disabled={actionLoading}
                        >
                          Mettre à jour
                        </Button>
                        
                        {activeOrder.status !== OrderStatus.DELIVERED && (
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setUpdateFormData(prev => ({ ...prev, status: OrderStatus.DELIVERED }));
                              setUpdateDialogOpen(true);
                            }}
                            disabled={actionLoading}
                            color="success"
                          >
                            Marquer comme livrée
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Update Order Dialog */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mettre à jour la commande
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={updateFormData.status}
                label="Statut"
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <MenuItem value={OrderStatus.CONFIRMED}>Confirmée</MenuItem>
                <MenuItem value={OrderStatus.IN_TRANSIT}>En livraison</MenuItem>
                <MenuItem value={OrderStatus.DELIVERED}>Livrée</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6">Détails financiers</Typography>
              <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Sous-total"
                  type="number"
                  value={updateFormData.subtotal}
                  onChange={(e) => handleFormChange('subtotal', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">MAD</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Frais de livraison"
                  type="number"
                  value={updateFormData.deliveryFee}
                  onChange={(e) => handleFormChange('deliveryFee', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">MAD</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Méthode de paiement</InputLabel>
              <Select
                value={updateFormData.paymentMethod}
                label="Méthode de paiement"
                onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="cash">Espèces</MenuItem>
                <MenuItem value="card">Carte</MenuItem>
                <MenuItem value="mobile_payment">Paiement mobile</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={updateFormData.isPaid}
                  onChange={(e) => handleFormChange('isPaid', e.target.checked)}
                />
              }
              label="Commande payée"
            />

            <TextField
              fullWidth
              label="Notes de livraison"
              multiline
              rows={3}
              value={updateFormData.deliveryNotes}
              onChange={(e) => handleFormChange('deliveryNotes', e.target.value)}
              placeholder="Ajoutez des notes sur la livraison..."
            />

            {updateFormData.subtotal && updateFormData.deliveryFee && (
              <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6">
                  Total: {(parseFloat(updateFormData.subtotal) + parseFloat(updateFormData.deliveryFee)).toFixed(2)} MAD
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateOrder}
            disabled={actionLoading}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
