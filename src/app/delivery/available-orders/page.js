'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Grid,
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
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  Email,
  Schedule,
  AttachMoney,
  Assignment,
  Visibility,
  CheckCircle
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
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.CONFIRMED:
      return 'info';
    case OrderStatus.PROCESSING:
      return 'secondary';
    case OrderStatus.READY:
      return 'primary';
    case OrderStatus.IN_TRANSIT:
      return 'info';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.CANCELLED:
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'En attente';
    case OrderStatus.CONFIRMED:
      return 'Confirmée';
    case OrderStatus.PROCESSING:
      return 'En préparation';
    case OrderStatus.READY:
      return 'Prête';
    case OrderStatus.IN_TRANSIT:
      return 'En livraison';
    case OrderStatus.DELIVERED:
      return 'Livrée';
    case OrderStatus.CANCELLED:
      return 'Annulée';
    default:
      return status;
  }
};

export default function AvailableOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "DELIVERY_MAN") {
      fetchAvailableOrders();
    }
  }, [status, session]);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/delivery/available-orders');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Erreur lors de la récupération des commandes');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleTakeOrder = async (orderId) => {
    try {
      setActionLoading(true);

      const response = await fetch('/api/delivery/take-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnackbar({
          open: true,
          message: 'Commande prise avec succès !',
          severity: 'success'
        });
        fetchAvailableOrders(); // Refresh the list
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Erreur lors de la prise de commande',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la prise de commande',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
        Commandes Disponibles
      </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
        Voici les commandes confirmées par l&apos;administration et disponibles pour la livraison.
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
          {orders.length === 0 ? (
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune commande disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes les commandes sont soit en cours de traitement, soit déjà assignées.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (            <Grid container spacing={3}>
              {orders.map((order) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={order._id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" component="div">
                          Commande #{order._id.slice(-8).toUpperCase()}
                        </Typography>
                        <Chip
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>

                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {order.contactInfo?.fullName}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {order.contactInfo?.phoneNumber}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {order.deliveryAddress?.formattedAddress}
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Contenu de la commande:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          backgroundColor: 'grey.100', 
                          p: 1, 
                          borderRadius: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {order.orderContent}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                      >
                        Voir détails
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleTakeOrder(order._id)}
                        disabled={actionLoading}
                        color="primary"
                      >
                        Prendre
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Order Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de la commande #{selectedOrder?._id?.slice(-8).toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Informations client
                </Typography>                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person sx={{ fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Nom complet
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.contactInfo?.fullName}
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
                          {selectedOrder.contactInfo?.phoneNumber}
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
                          {selectedOrder.contactInfo?.email}
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
                      {selectedOrder.deliveryAddress?.formattedAddress}
                    </Typography>
                    {selectedOrder.deliveryAddress?.additionalInfo && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.deliveryAddress.additionalInfo}
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
                  {selectedOrder.orderContent}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Informations sur la commande
                </Typography>                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Statut
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedOrder.status)}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date de création
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={() => {
              handleTakeOrder(selectedOrder._id);
              setViewDialogOpen(false);
            }}
            disabled={actionLoading}
          >
            Prendre cette commande
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
