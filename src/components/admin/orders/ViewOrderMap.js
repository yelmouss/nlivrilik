"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  useTheme,
} from "@mui/material";

// Importation des styles OpenLayers à l'exécution côté client uniquement
const MAP_PLACEHOLDER_HEIGHT = 300;

export default function ViewOrderMap({ coordinates = [0, 0], address = "" }) {
  const mapRef = useRef(null);
  const initializingRef = useRef(false);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);  const [mapLoaded, setMapLoaded] = useState(false); 
  
  // Effet pour charger la carte à l'exécution côté client uniquement
  useEffect(() => {
    // Ne pas réinitialiser si la carte existe déjà ou si le conteneur n'est pas prêt ou si déjà en cours d'initialisation
    if (mapLoaded || !mapRef.current || map || initializingRef.current) return; 
    
    // Fonction asynchrone pour initialiser la carte
    async function initializeMap() {
      try {
        initializingRef.current = true;
        setLoading(true);
        setError(null);

        // Importation dynamique des modules OpenLayers
        const [
          { default: Map },
          { default: View },
          { default: TileLayer },
          { default: OSM },
          { default: VectorLayer },
          { default: VectorSource },
          { default: Feature },
          { default: Point },
          { Style, Icon },
        ] = await Promise.all([
          import("ol/Map"),
          import("ol/View"),
          import("ol/layer/Tile"),
          import("ol/source/OSM"),
          import("ol/layer/Vector"),
          import("ol/source/Vector"),
          import("ol/Feature"),
          import("ol/geom/Point"),
          import("ol/style"),
        ]);

        // Import de la fonction de projection
        const { fromLonLat } = await import("ol/proj");

        // Vérifier que les coordonnées sont valides (utiliser les coordonnées actuelles)
        const validCoordinates =
          coordinates &&
          coordinates.length === 2 &&
          coordinates[0] !== 0 &&
          coordinates[1] !== 0
            ? coordinates
            : [3.0588, 36.7539]; // Coordonnées par défaut (Alger)

        // Créer le marqueur
        const markerFeature = new Feature({
          geometry: new Point(fromLonLat(validCoordinates)),
        });

        // Style du marqueur
        const markerStyle = new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            src: "/marker-icon.svg",
            scale: 0.5,
          }),
        });

        markerFeature.setStyle(markerStyle);

        // Créer la source et la couche vectorielle pour le marqueur
        const vectorSource = new VectorSource({
          features: [markerFeature],
        });

        const vectorLayer = new VectorLayer({
          source: vectorSource,
        });

        // Créer la carte
        const mapInstance = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
            vectorLayer,
          ],
          view: new View({
            center: fromLonLat(validCoordinates),
            zoom: 15,
          }),
          controls: [], // Pas de contrôles pour une carte en lecture seule
        });
        setMap(mapInstance);
        setMapLoaded(true);
        setLoading(false);
        initializingRef.current = false;
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la carte:", error);
        setError("Erreur lors du chargement de la carte");
        setLoading(false);
        initializingRef.current = false;
      }
    }

    // Initialiser la carte
    initializeMap(); 
    
    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (map) {
        map.setTarget(null);
        setMap(null);
        setMapLoaded(false);
        initializingRef.current = false;
      }
    };
  }, [coordinates, map, mapLoaded]); // Inclure les dépendances nécessaires// Effet pour mettre à jour le marqueur quand les coordonnées changent
  useEffect(() => {
    if (!map || !mapLoaded || loading) return;

    async function updateMarker() {
      try {
        const { fromLonLat } = await import("ol/proj");
        const { default: Feature } = await import("ol/Feature");
        const { default: Point } = await import("ol/geom/Point");
        const { Style, Icon } = await import("ol/style");

        // Vérifier que les coordonnées sont valides
        const validCoordinates =
          coordinates &&
          coordinates.length === 2 &&
          coordinates[0] !== 0 &&
          coordinates[1] !== 0
            ? coordinates
            : [3.0588, 36.7539];

        // Obtenir la couche vectorielle (deuxième couche)
        const layers = map.getLayers().getArray();
        const vectorLayer = layers[1];

        if (vectorLayer) {
          const vectorSource = vectorLayer.getSource();

          // Effacer les anciens marqueurs
          vectorSource.clear();

          // Créer un nouveau marqueur
          const markerFeature = new Feature({
            geometry: new Point(fromLonLat(validCoordinates)),
          }); // Style du marqueur
          const markerStyle = new Style({
            image: new Icon({
              anchor: [0.5, 1],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
              src: "/marker-icon.svg",
              scale: 0.1,
            }),
          });

          markerFeature.setStyle(markerStyle);
          vectorSource.addFeature(markerFeature);

          // Centrer la vue sur le nouveau marqueur
          map.getView().animate({
            center: fromLonLat(validCoordinates),
            duration: 500,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du marqueur:", error);
      }
    }
    updateMarker();
  }, [coordinates, map, mapLoaded, loading]);

  return (
    <Box
      sx={{
        position: "relative",
        height: MAP_PLACEHOLDER_HEIGHT,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        mb: 2,
        width: "100%",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box
          sx={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 2 }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />

      {address && (
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "4px 8px",
              borderRadius: theme.shape.borderRadius,
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            📍 {address}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
