"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useTranslations } from "next-intl";

// Import new components
import CurvedSection from "../components/CurvedSection";
import HeroSectionContent from "../components/HeroSectionContent";
import ServicesSection from "../components/ServicesSection";
import AboutSection from "../components/AboutSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CallToActionSection from "../components/CallToActionSection";
import SocialLinks from "../components/SocialLinks"; // Import the new component

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <>
      <SocialLinks /> {/* Add the new component here */}
      {/* Hero Section with Curve */}
      <CurvedSection
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          paddingX: 2,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <HeroSectionContent t={t} />
      </CurvedSection>

      {/* Main Content Area */}
      <Box sx={{ bgcolor: "background.paper", py: 6 }}>
        <Container maxWidth="lg">
          <ServicesSection t={t} />
          <AboutSection t={t} />
          <TestimonialsSection t={t} />
          <CallToActionSection t={t} />
        </Container>
      </Box>
    </>
  );
}
