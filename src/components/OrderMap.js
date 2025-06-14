'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

// Importation des styles OpenLayers à l'exécution côté client uniquement
const MAP_PLACEHOLDER_HEIGHT = 400;

export default function OrderMap({ onLocationSelect, initialCoordinates = [0, 0] }) {
  const mapRef = useRef(null);
  const theme = useTheme();
  const t = useTranslations('Order');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Effet pour charger la carte à l'exécution côté client uniquement
  useEffect(() => {
    // Fonction asynchrone pour initialiser la carte
    async function initializeMap() {
      try {
        // Importer dynamiquement OpenLayers uniquement côté client
        const ol = await import('ol');
        const View = (await import('ol/View')).default;        const TileLayer = (await import('ol/layer/Tile')).default;
        const OSM = (await import('ol/source/OSM')).default;
        const { fromLonLat, toLonLat } = await import('ol/proj');
        const VectorLayer = (await import('ol/layer/Vector')).default;
        const VectorSource = (await import('ol/source/Vector')).default;
        const Point = (await import('ol/geom/Point')).default;
        const Feature = (await import('ol/Feature')).default;
        const Style = (await import('ol/style/Style')).default;
        const Icon = (await import('ol/style/Icon')).default;
        const Control = await import('ol/control');
          // Importation des styles CSS d'OpenLayers
        await import('ol/ol.css');
        
        // Créer la source et la couche principale (OpenStreetMap)
        const osmSource = new OSM();
        const osmLayer = new TileLayer({ source: osmSource });
        
        // Créer la source et la couche pour le marqueur
        const markerSource = new VectorSource();
        const markerLayer = new VectorLayer({
          source: markerSource,
          style: new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: '/marker-icon.svg', // Assurez-vous d'avoir cette image dans votre dossier public
              scale: 0.2
            })
          })
        });
        
        // Coordonnées initiales (si fournies) ou position par défaut (Paris)
        const initialCenter = initialCoordinates[0] !== 0 && initialCoordinates[1] !== 0 
          ? fromLonLat(initialCoordinates) 
          : fromLonLat([2.3522, 48.8566]);        // Créer la carte
        const olMap = new ol.Map({
          target: mapRef.current,
          layers: [osmLayer, markerLayer],
          view: new View({
            center: initialCenter,
            zoom: 15
          }),
          controls: Control.default ? Control.default() : Control.defaults({
            attributionOptions: {
              collapsible: false
            }
          })
        });
        
        // Si des coordonnées initiales sont fournies, ajouter un marqueur
        if (initialCoordinates[0] !== 0 && initialCoordinates[1] !== 0) {
          const marker = new Feature({
            geometry: new Point(initialCenter)
          });
          markerSource.addFeature(marker);
        }
        
        // Fonction pour géolocaliser l'utilisateur
        const geolocate = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userCoords = [position.coords.longitude, position.coords.latitude];
                const mapCoords = fromLonLat(userCoords);
                
                // Déplacer la vue de la carte
                olMap.getView().animate({
                  center: mapCoords,
                  zoom: 15,
                  duration: 1000
                });
                
                // Mettre à jour le marqueur
                markerSource.clear();
                const marker = new Feature({
                  geometry: new Point(mapCoords)
                });
                markerSource.addFeature(marker);
                
                // Récupérer l'adresse à partir des coordonnées
                fetchAddressFromCoordinates(userCoords);
              },
              (error) => {
                console.error('Erreur de géolocalisation:', error);
                setError(t('geolocationError'));
              }
            );
          } else {
            setError(t('geolocationNotSupported'));
          }
        };
        
        // Tenter de géolocaliser l'utilisateur au chargement
        geolocate();
        
        // Gestionnaire d'événements pour les clics sur la carte
        olMap.on('click', (event) => {
          const clickedCoord = olMap.getCoordinateFromPixel(event.pixel);
          const lonLatCoord = toLonLat(clickedCoord);
          
          // Mettre à jour le marqueur
          markerSource.clear();
          const marker = new Feature({
            geometry: new Point(clickedCoord)
          });
          markerSource.addFeature(marker);
          
          // Récupérer l'adresse à partir des coordonnées
          fetchAddressFromCoordinates(lonLatCoord);
        });
        
        // Stocker la référence à la carte
        setMap(olMap);
        setMapLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
        setError(t('mapLoadError'));
        setLoading(false);
      }
    }
    
    // Initialiser la carte si l'élément ref existe
    if (mapRef.current && !mapLoaded) {
      initializeMap();
    }
    
    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (map) {
        map.setTarget(null);
      }
    };
  }, [mapRef, mapLoaded, initialCoordinates, t]);
  
  // Fonction pour récupérer l'adresse à partir des coordonnées (géocodage inverse)
  const fetchAddressFromCoordinates = async (coordinates) => {
    try {
      // Utilisation de l'API Nominatim d'OpenStreetMap pour le géocodage inverse
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lon=${coordinates[0]}&lat=${coordinates[1]}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'adresse');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Appeler la fonction de rappel avec les coordonnées et l'adresse formatée
        onLocationSelect({
          coordinates: coordinates,
          formattedAddress: data.display_name
        });
      }
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      setError(t('addressLookupError'));
    }
  };
  
  return (
    <Box sx={{ position: 'relative', height: MAP_PLACEHOLDER_HEIGHT, border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius }}>
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 2
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: '100%',
          '& .ol-zoom': {
            left: 'auto',
            right: '8px',
          }
        }} 
      />
      
      <Box sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, zIndex: 1, pointerEvents: 'none' }}>
        <Typography variant="caption" sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.7)', 
          padding: '4px 8px', 
          borderRadius: theme.shape.borderRadius,
          display: 'inline-block'
        }}>
          {t('mapInstructions')}
        </Typography>
      </Box>
    </Box>
  );
}
