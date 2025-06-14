"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid"; // Changed from @mui/material/Unstable_Grid2
import TestimonialCard from "./TestimonialCard";

const TestimonialsSection = ({ t }) => (
  <Box sx={{ textAlign: "center", mb: 6, minHeight: "50vh" }}>
    <Typography
      variant="h2"
      component="h2"
      fontWeight="bold"
      fontSize={{ xs: "2.5rem", sm: "3rem", md: "5rem" }}
      gutterBottom
      sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
      textAlign="center"
    >
      {t("testimonialsTitle")}
    </Typography>
    <Grid container spacing={3} sx={{ mt: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <TestimonialCard
          text={t("testimonial1Text")}
          author={t("testimonial1Author")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <TestimonialCard
          text={t("testimonial2Text")}
          author={t("testimonial2Author")}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}> {/* Removed item prop and used size prop */}
        <TestimonialCard
          text={t("testimonial3Text")}
          author={t("testimonial3Author")}
        />
      </Grid>
    </Grid>
  </Box>
);

export default TestimonialsSection;
