'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DeliveryRatingDialog from './DeliveryRatingDialog';
import DeliveryCompletedDialog from './DeliveryCompletedDialog';
import { useDeliveryRatingCheck } from '@/hooks/useDeliveryRating';

export default function AutoDeliveryRating({ 
  orderId, 
  onRatingCompleted,
  disabled = false 
}) {
  const { data: session } = useSession();
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const { shouldShowRating, order, markRatingShown } = useDeliveryRatingCheck(orderId);

  useEffect(() => {
    if (shouldShowRating && !disabled) {
      // Délai pour éviter l'ouverture immédiate
      const timer = setTimeout(() => {
        setCompletedDialogOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowRating, disabled]);

  const handleCompletedDialogClose = () => {
    setCompletedDialogOpen(false);
    markRatingShown();
  };

  const handleRateDelivery = () => {
    setCompletedDialogOpen(false);
    setRatingDialogOpen(true);
  };

  const handleRatingDialogClose = () => {
    setRatingDialogOpen(false);
    markRatingShown();
  };

  const handleRatingSubmitted = (rating) => {
    setRatingDialogOpen(false);
    markRatingShown();
    if (onRatingCompleted) {
      onRatingCompleted(rating);
    }
  };

  if (!shouldShowRating || !order || disabled) {
    return null;
  }

  return (
    <>
      <DeliveryCompletedDialog
        open={completedDialogOpen}
        onClose={handleCompletedDialogClose}
        order={order}
        onRateDelivery={handleRateDelivery}
      />
      
      <DeliveryRatingDialog
        open={ratingDialogOpen}
        onClose={handleRatingDialogClose}
        order={order}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
}
