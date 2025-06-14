"use client";
import * as React from "react";
import { motion } from "framer-motion";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Lottie from "lottie-react";
import Image from "next/image"; // Import Image component
import animationData from "../../public/AnimationHero.json";
import doubleQuotesIcon from "../../public/double-quotes.svg"; // Import the SVG
import doubleQuotesEndIcon from "../../public/double-quotes-end.svg"; // Import the new SVG for end quotes

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Image
            src={doubleQuotesIcon}
            alt="double quotes"
            width={50}
            height={50}
          />
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            fontSize={{ xs: "2.5rem", sm: "3rem", md: "5rem" }}
            color="secondary.main"
            gutterBottom
            sx={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              mb: 0, // Adjusted mb for alignment
            }}
          >
            {t("heroTitle")}
          </Typography>
          <Image
            src={doubleQuotesEndIcon}
            alt="double quotes end"
            width={50}
            height={50}
            sx={{ alignSelf: "flex-end" }} // Align this icon to the bottom of the flex line
          />
        </Box>
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
