"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Rating,
  Alert,
  CircularProgress,
  Divider
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";

export default function DeliveryRatingDialog({ 
  open, 
  onClose, 
  order, 
  onRatingSubmitted 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingRating, setExistingRating] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (open && order) {
      checkExistingRating();
    }
  }, [open, order]);

  const checkExistingRating = async () => {
    try {
      setCheckingExisting(true);
      const response = await fetch(`/api/ratings?orderId=${order._id}`);
      const data = await response.json();
      
      if (data.success && data.hasRating) {
        setExistingRating(data.rating);
      } else {
        setExistingRating(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'évaluation existante:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Veuillez donner une note");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order._id,
          rating: rating,
          comment: comment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onRatingSubmitted) {
          onRatingSubmitted(data.rating);
        }
        handleClose();
      } else {
        setError(data.message || "Erreur lors de l'enregistrement de l'évaluation");
      }
    } catch (error) {
      setError("Erreur de connexion lors de l'enregistrement");
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setError("");
    setExistingRating(null);
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Évaluer la livraison
      </DialogTitle>
      
      <DialogContent>
        {checkingExisting ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : existingRating ? (
          // Afficher l'évaluation existante
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Vous avez déjà évalué cette livraison
            </Alert>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Votre note :
              </Typography>
              <Rating
                value={existingRating.rating}
                readOnly
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
              />
            </Box>
            
            {existingRating.comment && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Votre commentaire :
                </Typography>
                <Typography variant="body2" sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  fontStyle: 'italic' 
                }}>
                  "{existingRating.comment}"
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Formulaire d'évaluation
          <Box>
            <Typography variant="body1" gutterBottom>
              Comment évaluez-vous cette livraison ?
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Commande : #{order._id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Livrée le {new Date(order.updatedAt).toLocaleString('fr-FR')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Votre note * :
              </Typography>
              <Rating
                name="delivery-rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                  setError("");
                }}
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
                size="large"
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                1 = Très insatisfait, 5 = Très satisfait
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Commentaire (optionnel)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce livreur..."
              inputProps={{ maxLength: 500 }}
              helperText={`${comment.length}/500 caractères`}
              sx={{ mb: 2 }}
            />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          {existingRating ? 'Fermer' : 'Annuler'}
        </Button>
        
        {!existingRating && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || rating === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Envoyer l'évaluation
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
