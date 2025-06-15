import { useState, useEffect } from 'react';

export function useDeliveryRatingCheck(orderId) {
  const [shouldShowRating, setShouldShowRating] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      checkOrderRatingStatus();
    }
  }, [orderId]);

  const checkOrderRatingStatus = async () => {
    try {
      setLoading(true);
      
      // Vérifier le statut de la commande
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      if (!orderResponse.ok) return;
      
      const orderData = await orderResponse.json();
      if (!orderData.success || orderData.order.status !== 'DELIVERED') return;
      
      // Vérifier si une évaluation existe déjà
      const ratingResponse = await fetch(`/api/ratings?orderId=${orderId}`);
      const ratingData = await ratingResponse.json();
      
      if (ratingData.success && !ratingData.hasRating) {
        setOrder(orderData.order);
        setShouldShowRating(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'évaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const markRatingShown = () => {
    setShouldShowRating(false);
  };

  return {
    shouldShowRating,
    order,
    loading,
    markRatingShown,
    refetch: checkOrderRatingStatus
  };
}
