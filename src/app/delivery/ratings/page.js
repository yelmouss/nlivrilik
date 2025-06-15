'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
  Stack,
  Paper,
  Rating
} from '@mui/material';
import {
  Star,
  Insights,
  Comment,
  Person
} from '@mui/icons-material';

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

export default function DeliveryRatingsPage() {
  const { data: session, status } = useSession();
  const [ratingsData, setRatingsData] = useState({
    stats: null,
    ratings: [],
    recentComments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "DELIVERY_MAN") {
      fetchRatings();
    }
  }, [status, session]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/delivery/ratings');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des évaluations');
      }

      const data = await response.json();
      
      if (data.success) {
        setRatingsData({
          stats: data.stats,
          ratings: data.ratings,
          recentComments: data.recentComments
        });
      } else {
        setError(data.message || 'Erreur lors de la récupération des évaluations');
      }
    } catch (err) {
      setError('Une erreur est survenue lors du chargement des évaluations');
      console.error('Ratings error:', err);
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

  if (status !== "authenticated" || session?.user?.role !== "DELIVERY_MAN") {
    return (
      <Alert severity="error">
        Accès refusé. Vous devez être connecté en tant que livreur.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Évaluations
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Consultez les retours et évaluations de vos clients.
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
      ) : (        <Grid container spacing={3}>
          {/* Statistiques générales */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Insights sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {ratingsData.stats?.averageRating || 0}
                </Typography>
                <Rating
                  value={ratingsData.stats?.averageRating || 0}
                  readOnly
                  precision={0.1}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Sur {ratingsData.stats?.totalRatings || 0} évaluation(s)
                </Typography>
              </CardContent>
            </Card>
          </Grid>          {/* Répartition des étoiles */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition des Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {ratingsData.stats?.ratingDistribution?.map((item) => (
                  <Box key={item.star} display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {item.star} étoile{item.star > 1 ? 's' : ''}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={ratingsData.stats.totalRatings > 0 
                        ? (item.count / ratingsData.stats.totalRatings) * 100 
                        : 0}
                      sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>          {/* Commentaires récents */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Commentaires Récents
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {ratingsData.recentComments?.length > 0 ? (
                  <Stack spacing={2}>
                    {ratingsData.recentComments.map((comment) => (
                      <Paper key={comment._id} elevation={1} sx={{ p: 2 }}>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box flexGrow={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="subtitle2">
                                {comment.customerName}
                              </Typography>
                              <Rating
                                value={comment.rating}
                                readOnly
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.createdAt)}
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              {comment.comment}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Comment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucun commentaire pour le moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Les commentaires de vos clients apparaîtront ici.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>          {/* Historique complet */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Toutes les Évaluations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {ratingsData.ratings?.length > 0 ? (
                  <Stack spacing={1}>
                    {ratingsData.ratings.map((rating) => (
                      <Box 
                        key={rating._id} 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between"
                        p={1}
                        sx={{
                          '&:hover': { bgcolor: 'action.hover' },
                          borderRadius: 1
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Rating
                            value={rating.rating}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2">
                            {rating.customerName}
                          </Typography>
                          {rating.comment && (
                            <Chip
                              label="Avec commentaire"
                              size="small"
                              variant="outlined"
                              icon={<Comment />}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(rating.createdAt)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Star sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucune évaluation pour le moment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vos évaluations apparaîtront ici après vos premières livraisons.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
