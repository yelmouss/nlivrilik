'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IconButton from '@mui/material/IconButton';
import OrderStatus from '@/models/OrderStatus';
import LottieCarousel from './LottieCarousel';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export default function OrderCard({ order, onStatusChange }) {
  const theme = useTheme();
  const t = useTranslations('Order');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Gestionnaire pour le changement d'état de la commande
  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await onStatusChange(order._id, newStatus);
    } finally {
      setLoading(false);
      if (newStatus === OrderStatus.CANCELLED) {
        setCancelDialogOpen(false);
      }
    }
  };
  
  // Gestionnaire pour l'ouverture/fermeture des détails
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Gestionnaire pour l'ouverture du dialogue de confirmation d'annulation
  const handleCancelDialogOpen = () => {
    setCancelDialogOpen(true);
  };
  
  // Gestionnaire pour la fermeture du dialogue de confirmation d'annulation
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
  };
  
  // Rendu du chip de statut avec la couleur correspondante
  const renderStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    let label = '';
    
    switch (status) {
      case OrderStatus.PENDING:
        color = 'warning';
        label = t('statusPending');
        break;
      case OrderStatus.CONFIRMED:
        color = 'info';
        label = t('statusConfirmed');
        break;
      case OrderStatus.DELIVERED:
        color = 'success';
        icon = <CheckCircleIcon />;
        label = t('statusDelivered');
        break;
      case OrderStatus.CANCELLED:
        color = 'error';
        icon = <CancelIcon />;
        label = t('statusCancelled');
        break;
      default:
        label = status;
    }
    
    return (
      <Chip 
        color={color} 
        label={label} 
        icon={icon}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    );
  };
  
  // Options d'action en fonction du statut actuel
  const renderActionButtons = () => {
    // Si la commande est en cours de chargement, afficher un indicateur
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    
    // Actions disponibles en fonction du statut
    switch (order.status) {
      case OrderStatus.PENDING:
        return (
          <>
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              onClick={handleCancelDialogOpen}
              startIcon={<CancelIcon />}
            >
              {t('cancelOrder')}
            </Button>
          </>
        );
      case OrderStatus.CONFIRMED:
        return (
          <Typography variant="body2" color="text.secondary">
            {t('orderBeingProcessed')}
          </Typography>
        );
      case OrderStatus.DELIVERED:
        return (
          <Typography variant="body2" color="success.main">
            {t('orderCompleted')}
          </Typography>
        );
      case OrderStatus.CANCELLED:
        return (
          <Typography variant="body2" color="error.main">
            {t('orderCancelled')}
          </Typography>
        );
      default:
        return null;
    }
  };
  
  return (
    <>

     {/* Animation carousel displayed at the bottom of the card */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <LottieCarousel />
        </Box>
      <Card variant="outlined" sx={{ mb: 2, borderColor: theme.palette.divider }}>        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs: 8}}>
              <Typography variant="subtitle1" component="div">
                {t('orderNumber')}: {order._id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(order.createdAt)}
              </Typography>
            </Grid>
            <Grid size={{xs: 4}} sx={{ textAlign: 'right' }}>
              {renderStatusChip(order.status)}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <ShoppingBasketIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
            <Typography variant="body2" sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {order.orderContent}
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
          {renderActionButtons()}
          
          <Button
            onClick={toggleExpanded}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
          >
            {expanded ? t('hideDetails') : t('showDetails')}
          </Button>
        </CardActions>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {t('contactInformation')}
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{xs: 12}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2">
                    {order.contactInfo.fullName}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{xs: 12}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2">
                    {order.contactInfo.email}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{xs: 12}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  <Typography variant="body2">
                    {order.contactInfo.phoneNumber}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
              {t('deliveryAddress')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationOnIcon sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} fontSize="small" />
              <Typography variant="body2">
                {order.deliveryAddress.formattedAddress}
                {order.deliveryAddress.additionalInfo && (
                  <>
                    <br />
                    <Typography variant="body2" color="text.secondary">
                      {t('additionalInfo')}: {order.deliveryAddress.additionalInfo}
                    </Typography>
                  </>
                )}
              </Typography>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
              {t('orderHistory')}
            </Typography>
            {order.statusHistory && order.statusHistory.length > 0 ? (
              order.statusHistory.map((historyItem, index) => (
                <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  {renderStatusChip(historyItem.status)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {formatDate(historyItem.timestamp)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('noHistoryAvailable')}
              </Typography>
            )}
            
            {order.status === OrderStatus.DELIVERED && order.financialDetails && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                  {t('financialDetails')}
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('subtotal')}:
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" align="right">
                      {order.financialDetails.subtotal.toFixed(2)} €
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('deliveryFee')}:
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" align="right">
                      {order.financialDetails.deliveryFee.toFixed(2)} €
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" fontWeight="bold">
                      {t('total')}:
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" fontWeight="bold" align="right">
                      {order.financialDetails.total.toFixed(2)} €
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('paymentMethod')}:
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" align="right">
                      {t(`paymentMethod_${order.financialDetails.paymentMethod}`)}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('paymentStatus')}:
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" align="right">
                      {order.financialDetails.isPaid ? (
                        <span style={{ color: theme.palette.success.main }}>{t('paid')}</span>
                      ) : (
                        <span style={{ color: theme.palette.error.main }}>{t('unpaid')}</span>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}          </CardContent>
        </Collapse>
        
       
      </Card>
      
      {/* Dialogue de confirmation pour l'annulation de commande */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
      >
        <DialogTitle>{t('confirmCancellation')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('cancelConfirmationText')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            {t('back')}
          </Button>
          <Button 
            onClick={() => handleStatusChange(OrderStatus.CANCELLED)} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
