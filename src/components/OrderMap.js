'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const markerSourceRef = useRef(null);
  const initializedRef = useRef(false); // Empêche double init

  // Fonction pour récupérer l'adresse à partir des coordonnées (géocodage inverse)
  const fetchAddressFromCoordinates = useCallback(async (coordinates) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lon=${coordinates[0]}&lat=${coordinates[1]}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'adresse');
      const data = await response.json();
      if (data && data.display_name) {
        onLocationSelect({ coordinates, formattedAddress: data.display_name });
      }
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      setError(t('addressLookupError'));
    }
  }, [onLocationSelect, t]);

  // Initialisation de la carte une seule fois
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    let olMap = null;
    let markerSource = null;
    let markerLayer = null;
    let cleanup = null;
    async function initializeMap() {
      try {
        const ol = await import('ol');
        const View = (await import('ol/View')).default;
        const TileLayer = (await import('ol/layer/Tile')).default;
        const OSM = (await import('ol/source/OSM')).default;
        const VectorLayer = (await import('ol/layer/Vector')).default;
        const VectorSource = (await import('ol/source/Vector')).default;
        const Point = (await import('ol/geom/Point')).default;
        const Feature = (await import('ol/Feature')).default;
        const Style = (await import('ol/style/Style')).default;
        const Icon = (await import('ol/style/Icon')).default;
        const { fromLonLat, toLonLat } = await import('ol/proj');
        const Control = await import('ol/control');
        // Create marker source and layer BEFORE map
        markerSource = new VectorSource();
        markerSourceRef.current = markerSource;
        markerLayer = new VectorLayer({
          source: markerSource,
          style: new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: '/marker-icon.svg',
              scale: 0.2
            })
          })
        });
        // Coordonnées du centre du Maroc
        const marocCenter = [-7.0926, 31.7917];
        // BBOX Maroc: [Ouest, Sud, Est, Nord] (lon/lat)
        const marocExtentLonLat = [-13.17, 21.34, -0.99, 35.92];
        // Convertir l'extent en projection Web Mercator
        const marocExtent = [
          ...fromLonLat([marocExtentLonLat[0], marocExtentLonLat[1]]), // SW
          ...fromLonLat([marocExtentLonLat[2], marocExtentLonLat[3]])  // NE
        ];
        const initialCenter = (initialCoordinates[0] !== 0 && initialCoordinates[1] !== 0)
          ? fromLonLat(initialCoordinates)
          : fromLonLat(marocCenter);
        olMap = new ol.Map({
          target: mapRef.current,
          layers: [new TileLayer({ source: new OSM() }), markerLayer],
          view: new View({
            center: initialCenter,
            zoom: 6, // Zoom adapté au Maroc
            minZoom: 5,
            maxZoom: 18,
            extent: marocExtent
          }),
          controls: Control.default ? Control.default() : Control.defaults({ attributionOptions: { collapsible: false } })
        });

        // Ajout du marqueur initial si coordonnées valides
        if (initialCoordinates[0] !== 0 && initialCoordinates[1] !== 0) {
          const marker = new Feature({ geometry: new Point(initialCenter) });
          markerSource.addFeature(marker);
        }

        // Gestionnaire d'événements pour les clics sur la carte
        olMap.on('click', (event) => {
          const clickedCoord = olMap.getCoordinateFromPixel(event.pixel);
          const lonLatCoord = toLonLat(clickedCoord);
          markerSource.clear();
          const marker = new Feature({ geometry: new Point(clickedCoord) });
          markerSource.addFeature(marker);
          fetchAddressFromCoordinates(lonLatCoord);
        });

        setMap(olMap);
        setLoading(false);
        cleanup = () => {
          olMap.setTarget(null);
        };
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
        setError(t('mapLoadError'));
        setLoading(false);
      }
    }
    if (mapRef.current && !map) {
      initializeMap();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [t, fetchAddressFromCoordinates, initialCoordinates, map]);

  // Synchroniser la position du marqueur et la vue si initialCoordinates change
  useEffect(() => {
    if (
      map &&
      Array.isArray(initialCoordinates) &&
      initialCoordinates.length === 2 &&
      typeof initialCoordinates[0] === 'number' &&
      typeof initialCoordinates[1] === 'number' &&
      (initialCoordinates[0] !== 0 || initialCoordinates[1] !== 0)
    ) {
      import('ol/proj').then(({ fromLonLat }) => {
        import('ol/geom/Point').then(({ default: Point }) => {
          import('ol/Feature').then(({ default: Feature }) => {
            const markerSource = markerSourceRef.current;
            if (!markerSource) return;
            markerSource.clear();
            const marker = new Feature({ geometry: new Point(fromLonLat(initialCoordinates)) });
            markerSource.addFeature(marker);
            map.getView().animate({ center: fromLonLat(initialCoordinates), zoom: 15, duration: 800 });
          });
        });
      });
    }
  }, [initialCoordinates, map]);
  
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
        id="order-map-container"
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
