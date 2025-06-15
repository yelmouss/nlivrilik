'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Avatar,
  Chip
} from '@mui/material';
import { CheckCircle, Star } from '@mui/icons-material';

export default function DeliveryCompletedDialog({ 
  open, 
  onClose, 
  order, 
  onRateDelivery 
}) {
  if (!order) return null;

  const deliveryMan = order.deliveryDetails?.assignedTo;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
        <Typography variant="h5" component="div">
          Commande Livrée !
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box textAlign="center">
          <Typography variant="body1" gutterBottom>
            Votre commande <strong>#{order._id?.slice(-8)}</strong> a été livrée avec succès.
          </Typography>
          
          {deliveryMan && (
            <Box mt={3} mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Livrée par
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {deliveryMan.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body1" fontWeight="medium">
                  {deliveryMan.name}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" mt={2}>
            Nous espérons que vous êtes satisfait(e) de votre commande. 
            Souhaitez-vous évaluer votre livreur ?
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Plus tard
        </Button>
        <Button 
          onClick={onRateDelivery}
          variant="contained"
          startIcon={<Star />}
        >
          Évaluer le livreur
        </Button>
      </DialogActions>
    </Dialog>
  );
}
