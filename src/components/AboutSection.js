"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Image from "next/image";

const AboutSection = ({ t }) => (
  <Box sx={{ textAlign: "center", mb: 6, minHeight: "100vh" }}>
    <Typography
      variant="h2"
      component="h2"
      fontWeight="bold"
      fontSize={{ xs: "2.5rem", sm: "3rem", md: "5rem" }}
      gutterBottom
      sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
    >
      {t("aboutTitle")}
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
      <Image
        src="/logo.png"
        alt={'NLivri Lik Logo'}
        width={300}
        height={300}
      />
    </Box>
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ maxWidth: "700px", margin: "0 auto" }}
    >
      {t("aboutDescription")}
    </Typography>
  </Box>
);

export default AboutSection;
