"use client";
import * as React from "react";
import { motion } from "framer-motion";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Lottie from "lottie-react";
import animationData from "../../public/AnimationHero.json";

const HeroSectionContent = ({ t, scale }) => (
  <Container
    maxWidth="md"
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexGrow: 1,
      justifyContent: "space-between",
      width: "100%",
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <motion.div style={{ scale }}>
        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          fontSize={{ xs: "2.5rem", sm: "3rem", md: "5rem" }}
          gutterBottom
          sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
        >
          {t("heroTitle")}
        </Typography>
      </motion.div>

      <Box sx={{ width: "100%", maxWidth: 400, margin: "0 auto", my: 0 }}>
        <Lottie animationData={animationData} loop={true} />
      </Box>

      <Typography variant="h5" component="p" sx={{ mb: 4 }}>
        {t("heroSubtitle")}
      </Typography>
    </Box>

    <Button
      variant="contained"
      color="secondary"
      size="large"
      href="/order"
      sx={{ mb: 2 }}
    >
      {t("orderNowButton")}
    </Button>
  </Container>
);

export default HeroSectionContent;
