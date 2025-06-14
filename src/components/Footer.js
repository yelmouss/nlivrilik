'use client';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';

export default function Footer() {
  const t = useTranslations(); // This should be fine if useTranslations() loads all namespaces
  const theme = useTheme();
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([3.0588, 36.7764]), // Algiers coordinates
          zoom: 12,
        }),
      });

      // Custom marker
      const marker = new Feature({
        geometry: new Point(fromLonLat([3.0588, 36.7764])),
      });

      // Style for the marker using a custom icon (e.g., logo.png)
      // Ensure you have a marker icon in your public folder or provide a valid URL
      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: '/logo.png', // Path to your logo/marker icon
          scale: 0.5, // Adjust scale as needed
        }),
      });

      marker.setStyle(iconStyle);

      const vectorSource = new VectorSource({
        features: [marker],
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);

      // Clean up on unmount
      return () => map.setTarget(undefined);
    }
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        py: 6, // Increased padding
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper, // Use theme background
        borderTop: `1px solid ${theme.palette.divider}`, // Add a top border
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5}>
          {/* Map Section */}
          <Grid size={{xs:12, md:6}}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
              {t('common.footerOurLocation')}
            </Typography>
            <Box
              ref={mapRef}
              sx={{
                width: '100%',
                height: '300px', // Adjust height as needed
                borderRadius: theme.shape.borderRadius,
                overflow: 'hidden', // Ensures the map corners are rounded
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </Grid>

          {/* Useful Links Section */}
          <Grid size={{xs:12, md:3}}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
              {t('common.footerUsefulLinks')}
            </Typography>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              {t('common.footerPrivacyPolicy')}
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              {t('common.footerTermsOfService')}
            </Link>
            <Link href="#" variant="body2" display="block" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              {t('common.footerFAQ')}
            </Link>
            <Link href="/contact" variant="body2" display="block" sx={{ color: theme.palette.text.secondary }}>
              {t('common.Contact')}
            </Link>
          </Grid>

          {/* Contact/Logo Section or additional links */}
          <Grid size={{xs:12, md:3}}>
            {/* You can add more links, contact info, or a small logo here */}
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
              NlivriLik
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {t('HomePage.aboutDescription')}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" align="center" sx={{ pt: 4, color: theme.palette.text.secondary }}>
          {t('common.footerCopyright', { year: new Date().getFullYear() })}
        </Typography>
      </Container>
    </Box>
  );
}