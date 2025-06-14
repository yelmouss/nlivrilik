"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const CallToActionSection = ({ t }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 4,
    }}
  >
    <Typography variant="h5" component="h3" gutterBottom>
      {t("ctaTitle")}
    </Typography>
    <Button
      variant="contained"
      color="primary"
      size="large"
      href="https://wa.me/yourwhatsappnumber" 
      target="_blank"
      sx={{
        transition:
          "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: 6,
        },
      }}
    >
      {t("ctaButton")}
    </Button>
  </Box>
);

export default CallToActionSection;
