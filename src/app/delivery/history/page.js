'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  Email,
  Schedule,
  AttachMoney,
  Star,
  Visibility,
  Search,
  TrendingUp
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
    case OrderStatus.DELIVERED:
      return 'Livrée';
    case OrderStatus.CANCELLED:
      return 'Annulée';
    default:
      return status;
  }
};

export default function DeliveryHistoryPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "DELIVERY_MAN") {
      fetchDeliveryHistory();
    }
  }, [status, session]);

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/delivery/history');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
      } else {
        setError(data.message || 'Erreur lors de la récupération de l\'historique');
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const searchableFields = [
      order._id,
      order.contactInfo?.fullName,
      order.contactInfo?.phoneNumber,
      order.deliveryAddress?.formattedAddress
    ];

    return searchTerm === '' || 
           searchableFields.some(field => 
             field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  // Paginate orders
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        Historique des Livraisons
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Consultez toutes vos livraisons terminées et vos performances.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Livraisons
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalDeliveries}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Gains Total
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalEarnings.toFixed(2)} MAD
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Note Moyenne
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h4">
                      {stats.averageRating.toFixed(1)}
                    </Typography>
                    <Star sx={{ color: 'warning.main' }} />
                  </Box>
                </Box>
                <Star sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Taux de Réussite
                  </Typography>
                  <Typography variant="h4">
                    {stats.completionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Orders Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Commande</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          {searchTerm ? 'Aucune commande trouvée' : 'Aucune livraison dans l\'historique'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {order.contactInfo?.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.contactInfo?.phoneNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.deliveryDetails?.actualDeliveryTime || order.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.financialDetails?.total ? 
                              `${order.financialDetails.total.toFixed(2)} MAD` : 
                              'N/A'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.rating?.rating ? (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2">
                                {order.rating.rating.toFixed(1)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Non notée
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewOrder(order)}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
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

              {selectedOrder.financialDetails && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Détails financiers
                    </Typography>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Sous-total:</Typography>
                        <Typography variant="body2">
                          {selectedOrder.financialDetails.subtotal.toFixed(2)} MAD
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Frais de livraison:</Typography>
                        <Typography variant="body2">
                          {selectedOrder.financialDetails.deliveryFee.toFixed(2)} MAD
                        </Typography>
                      </Box>
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">Total:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {selectedOrder.financialDetails.total.toFixed(2)} MAD
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Méthode de paiement:</Typography>
                        <Chip 
                          label={selectedOrder.financialDetails.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </Box>
                </>
              )}

              {selectedOrder.rating && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Évaluation du client
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Star sx={{ color: 'warning.main' }} />
                      <Typography variant="h6">
                        {selectedOrder.rating.rating}/5
                      </Typography>
                    </Box>
                    {selectedOrder.rating.comment && (
                      <Typography variant="body1" sx={{ 
                        backgroundColor: 'success.light', 
                        color: 'success.contrastText',
                        p: 2, 
                        borderRadius: 1,
                        fontStyle: 'italic'
                      }}>
                        "{selectedOrder.rating.comment}"
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {selectedOrder.deliveryDetails?.deliveryNotes && (
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
                      {selectedOrder.deliveryDetails.deliveryNotes}
                    </Typography>
                  </Box>
                </>
              )}

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Dates importantes
                </Typography>                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date de création
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Grid>
                  {selectedOrder.deliveryDetails?.actualDeliveryTime && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Date de livraison
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedOrder.deliveryDetails.actualDeliveryTime)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
