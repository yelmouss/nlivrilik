"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid"; // Changed from @mui/material/Unstable_Grid2
import ServiceCard from "./ServiceCard";
import animationData1 from "../../public/AnimationService1.json";
import animationData2 from "../../public/AnimationHero.json";
import animationData3 from "../../public/AnimationService2.json";

const ServicesSection = ({ t }) => (
  <Box sx={{ textAlign: "center", mb: 6, minHeight: "100vh" }}>
    <Typography
      variant="h2"
      component="h2"
      fontWeight="bold"
      fontSize={{ xs: "2.5rem", sm: "3rem", md: "5rem" }}
      gutterBottom
      sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
    >
      {t("servicesOfferedTitle")} 
    </Typography>

    <Typography variant="subtitle1" color="text.secondary.contrastText" sx={{ mb: 4 }}>
      {t("servicesOfferedSubtitle")}
    </Typography>
    <Grid container spacing={4} sx={{ mt: 4, mb: 6 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <ServiceCard
          title={t("serviceCard1Title")}
          description={t("serviceCard1Description")}
          animationData={animationData1}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <ServiceCard
          title={t("serviceCard2Title")}
          description={t("serviceCard2Description")}
          animationData={animationData2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <ServiceCard
          title={t("serviceCard3Title")}
          description={t("serviceCard3Description")}
          animationData={animationData3}
        />
      </Grid>
    </Grid>
  </Box>
);

export default ServicesSection;
