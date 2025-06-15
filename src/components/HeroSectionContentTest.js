"use client";
import * as React from "react";
import { motion } from "framer-motion";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Lottie from "lottie-react";
import Image from "next/image";
import animationData from "../../public/AnimationHero.json";
import doubleQuotesIcon from "../../public/double-quotes.svg";
import doubleQuotesEndIcon from "../../public/double-quotes-end.svg";

const HeroSectionContentTest = ({ t }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
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
        <div style={{ opacity: 0 }}>Loading...</div>
      </Container>
    );
  }

  return (
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            scale: isVisible ? 1 : 0.5,
            y: isVisible ? 0 : 50
          }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            delay: 0.2
          }}
          whileHover={{ scale: 1.05 }}
        >
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
                mb: 0,
              }}
            >
              {t("heroTitle")}
            </Typography>
            <Image
              src={doubleQuotesEndIcon}
              alt="double quotes end"
              width={50}
              height={50}
              sx={{ alignSelf: "flex-end" }}
            />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Box sx={{ width: "100%", maxWidth: 400, margin: "0 auto", my: 0 }}>
            <Lottie animationData={animationData} loop={true} />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Typography variant="h5" component="p" sx={{ mb: 4 }}>
            {t("heroSubtitle")}
          </Typography>
        </motion.div>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          href="/order"
          sx={{ mb: 2 }}
        >
          {t("orderNowButton")}
        </Button>
      </motion.div>
    </Container>
  );
};

export default HeroSectionContentTest;
