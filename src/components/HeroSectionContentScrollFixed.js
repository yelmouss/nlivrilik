"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Lottie from "lottie-react";
import Image from "next/image";
import animationData from "../../public/AnimationHero.json";
import doubleQuotesIcon from "../../public/double-quotes.svg";
import doubleQuotesEndIcon from "../../public/double-quotes-end.svg";

const HeroSectionContent = ({ t }) => {
  // Utiliser useScroll sans target pour suivre le scroll global
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [0.8, 1.2]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // Debug logging
  React.useEffect(() => {
    const unsubscribeScrollY = scrollY.onChange((value) => {
      console.log("scrollY:", value, "scale:", scale.get());
    });
    return unsubscribeScrollY;
  }, [scrollY, scale]);

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
          style={{ scale, opacity }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Box sx={{ width: "100%", maxWidth: 400, margin: "0 auto", my: 0 }}>
            <Lottie animationData={animationData} loop={true} />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography variant="h5" component="p" sx={{ mb: 4 }}>
            {t("heroSubtitle")}
          </Typography>
        </motion.div>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
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

export default HeroSectionContent;
