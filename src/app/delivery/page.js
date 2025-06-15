
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Assignment,
  LocalShipping,
  Star,
  TrendingUp,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import Link from 'next/link';
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

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState({
    activeOrder: null,
    availableOrdersCount: 0,
    todayDeliveries: 0,
    totalDeliveries: 0,
    averageRating: 0,
    isAvailable: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "DELIVERY_MAN") {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/delivery/dashboard');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
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
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'auto'
    }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue, {session?.user?.name}! Voici un aperçu de vos activités de livraison.
        </Typography>
      </Box>

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
          {/* Status Card */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: dashboardData.isAvailable ? 'success.light' : 'grey.100' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <LocationOn sx={{ fontSize: 32, color: dashboardData.isAvailable ? 'success.main' : 'text.secondary' }} />
              <Box>
                <Typography variant="h6" color={dashboardData.isAvailable ? 'success.dark' : 'text.secondary'}>
                  Statut: {dashboardData.isAvailable ? 'Disponible' : 'Indisponible'}
                </Typography>
                <Typography variant="body2" color={dashboardData.isAvailable ? 'success.dark' : 'text.secondary'}>
                  {dashboardData.isAvailable 
                    ? 'Vous êtes prêt à recevoir de nouvelles commandes'
                    : 'Activez votre disponibilité pour recevoir des commandes'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Commandes disponibles
                      </Typography>
                      <Typography variant="h4">
                        {dashboardData.availableOrdersCount}
                      </Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Livraisons aujourd'hui
                      </Typography>
                      <Typography variant="h4">
                        {dashboardData.todayDeliveries}
                      </Typography>
                    </Box>
                    <AccessTime sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Total livraisons
                      </Typography>
                      <Typography variant="h4">
                        {dashboardData.totalDeliveries}
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Note moyenne
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h4">
                          {dashboardData.averageRating.toFixed(1)}
                        </Typography>
                        <Star sx={{ color: 'warning.main' }} />
                      </Box>
                    </Box>
                    <Star sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Active Order Section */}
          {dashboardData.activeOrder ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ma commande active
                </Typography>
                <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Commande #{dashboardData.activeOrder._id.slice(-8).toUpperCase()}
                        </Typography>
                        <Chip
                          label={getStatusLabel(dashboardData.activeOrder.status)}
                          color={getStatusColor(dashboardData.activeOrder.status)}
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {dashboardData.activeOrder.deliveryAddress?.formattedAddress}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Créée le {formatDate(dashboardData.activeOrder.createdAt)}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 1, 
                        borderRadius: 1,
                        maxHeight: 60,
                        overflow: 'hidden'
                      }}>
                        {dashboardData.activeOrder.orderContent}
                      </Typography>
                    </Stack>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="contained"
                        component={Link}
                        href="/delivery/active-order"
                        startIcon={<LocalShipping />}
                        fullWidth
                      >
                        Gérer la livraison
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Aucune commande active
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                    Vous n'avez actuellement aucune commande en cours de livraison.
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    href="/delivery/available-orders"
                    startIcon={<Assignment />}
                  >
                    Voir les commandes disponibles
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                    <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom align="center">
                      Commandes disponibles
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                      Consultez et prenez de nouvelles commandes
                    </Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/delivery/available-orders"
                      fullWidth
                    >
                      Voir les commandes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom align="center">
                      Historique
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                      Consultez vos livraisons passées
                    </Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/delivery/history"
                      fullWidth
                    >
                      Voir l'historique
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                    <Star sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom align="center">
                      Mes évaluations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                      Consultez vos notes et commentaires
                    </Typography>
                    <Button
                      variant="outlined"
                      component={Link}
                      href="/delivery/ratings"
                      fullWidth
                    >
                      Voir les évaluations
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
