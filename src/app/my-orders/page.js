'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Paper, Grid, Divider, Chip, Button, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslations } from 'next-intl';

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations('MyOrders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    // Rediriger vers la page de connexion si non authentifié
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    
    // Charger les commandes si l'utilisateur est authentifié
    if (status === 'authenticated') {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/orders');
          const data = await response.json();
          
          if (data.success) {
            setOrders(data.orders);
          } else {
            setError(data.message || t('errorLoadingOrders'));
          }
        } catch (err) {
          setError(t('errorLoadingOrders'));
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchOrders();
    }
  }, [status, router, t]);

  // Fonction pour afficher le statut avec la couleur correspondante
  const renderStatus = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'delivered':
        color = 'success';
        label = t('statusDelivered');
        break;
      case 'in_transit':
        color = 'primary';
        label = t('statusInTransit');
        break;
      case 'pending':
        color = 'warning';
        label = t('statusPending');
        break;
      case 'cancelled':
        color = 'error';
        label = t('statusCancelled');
        break;
      default:
        color = 'default';
        label = status;
    }
    
    return <Chip color={color} label={label} size="small" />;
  };

  if (status === 'loading' || loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.palette.custom.darkTeal, fontWeight: 700 }}>
        {t('pageTitle')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {orders.length === 0 && !loading && !error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocalShippingIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {t('noOrders')}
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {t('noOrdersMessage')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component="a" 
            href="/"
          >
            {t('startOrdering')}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {t('orderId')}: {order.id}
                  </Typography>
                  {renderStatus(order.status)}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="textSecondary">
                    {new Date(order.date).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="textSecondary">
                    {order.address}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        {item.quantity} x {item.name}
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {item.price.toFixed(2)} €
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('trackingNumber')}: {order.trackingNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {t('total')}: {order.total.toFixed(2)} €
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    sx={{ mr: 2 }}
                  >
                    {t('trackOrder')}
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                  >
                    {t('orderDetails')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
