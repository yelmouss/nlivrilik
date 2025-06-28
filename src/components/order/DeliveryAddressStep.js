"use client";

import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OrderMap from "@/components/OrderMap";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";

export default function DeliveryAddressStep({
  address = "",
  coordinates,
  additionalAddressInfo = "",
  onLocationSelect,
  onAdditionalInfoChange,
  onAddressChange,
}) {
  const t = useTranslations("Order");
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(coordinates);

  // Fetch address suggestions from Photon API (no API key required)
  useEffect(() => {
    if (searchInput.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    const controller = new AbortController();
    // BBOX Maroc: [Ouest, Sud, Est, Nord] (lon/lat)
    const bbox = "-13.17,21.34,-0.99,35.92";
    fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        searchInput
      )}&lang=fr&limit=5&bbox=${bbox}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data.features || []);
        setLoadingSuggestions(false);
      })
      .catch(() => setLoadingSuggestions(false));
    return () => controller.abort();
  }, [searchInput]);

  // Helper pour générer un label lisible
  const getSuggestionLabel = (option) => {
    if (!option) return "";
    if (option.properties?.label) return option.properties.label;
    const p = option.properties || {};
    return [p.name, p.street, p.city, p.state, p.country]
      .filter(Boolean)
      .join(", ");
  };

  // When a suggestion is selected, update address and coordinates
  const handleSuggestionSelect = (event, value) => {
    if (
      value &&
      typeof value === "object" &&
      value.geometry &&
      value.properties
    ) {
      const formatted = value.properties.label || getSuggestionLabel(value);
      const coords = [...value.geometry.coordinates]; // clone pour forcer le changement de référence
      setSelectedCoordinates(coords);
      // Only update address if it is different from the current value
      if (formatted !== address) {
        onAddressChange(formatted);
      }
      onLocationSelect({ coordinates: coords, formattedAddress: formatted });
      setSearchInput(formatted);
    } else if (typeof value === "string") {
      if (value !== address) {
        onAddressChange(value);
      }
      setSearchInput(value);
    }
  };

  // Synchronise la map quand on clique dessus
  const handleMapLocationSelect = ({ coordinates, formattedAddress }) => {
    setSelectedCoordinates([...coordinates]); // clone pour forcer le changement de référence
    // Only update address if it is different from the current value
    if (formattedAddress !== address) {
      onAddressChange(formattedAddress);
    }
    onLocationSelect({ coordinates, formattedAddress });
    setSearchInput(formattedAddress);
  };

  // Synchronise selectedCoordinates avec coordinates du parent UNIQUEMENT si la prop change
  useEffect(() => {
    if (
      Array.isArray(coordinates) &&
      (selectedCoordinates[0] !== coordinates[0] ||
        selectedCoordinates[1] !== coordinates[1])
    ) {
      setSelectedCoordinates([...coordinates]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("deliveryAddress")}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          getOptionLabel={getSuggestionLabel}
          loading={loadingSuggestions}
          inputValue={searchInput || ""}
          onInputChange={(_, value, reason) => {
            if (reason === "input") setSearchInput(value);
          }}
          onChange={handleSuggestionSelect}
          renderOption={(props, option, { index }) => (
            <li
              {...props}
              key={
                option.properties?.osm_id +
                "-" +
                option.properties?.osm_type +
                "-" +
                index
              }
            >
              {getSuggestionLabel(option)}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("searchAddress")}
              placeholder={
                t("searchAddressPlaceholder") || "Rechercher une adresse..."
              }
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ height: 400, mb: 3 }}>
        <OrderMap
          onLocationSelect={handleMapLocationSelect}
          initialCoordinates={selectedCoordinates}
        />
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="address"
            name="address"
            label={t("address")}
            value={address || ""}
            onChange={(e) => onAddressChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
            helperText={t("selectLocationOnMap")}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            id="additionalAddressInfo"
            name="additionalAddressInfo"
            label={t("additionalAddressInfo")}
            placeholder={t("additionalAddressInfoPlaceholder")}
            value={additionalAddressInfo || ""}
            onChange={(e) => onAdditionalInfoChange(e.target.value)}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
