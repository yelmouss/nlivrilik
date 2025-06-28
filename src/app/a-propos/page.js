
"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslations } from "next-intl";
// Images à afficher dans la galerie
const aboutPhotos = [
  "/aboutPhotos/000_WC0FM-768x511.jpg",
  "/aboutPhotos/greenfruits.png",
  "/aboutPhotos/legumes-vendus-marche_132075-5682.jpg",
  "/aboutPhotos/pharmacy.png",
  "/aboutPhotos/unnamed.png",
  "/aboutPhotos/unnamed%20(1).png",
  "/aboutPhotos/unnamed%20(2).png",
];
export default function AboutPage() {
  const t = useTranslations("HomePage");
  return (
    <Container maxWidth="xl" sx={{ minHeight: "100vh", py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ textAlign: "center", width: "100%" }}>
        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          fontSize={{ xs: "2.7rem", sm: "3.5rem", md: "5rem" }}
          gutterBottom
          sx={{ textShadow: "2px 2px 8px rgba(0,0,0,0.25)", color: "primary.main", mb: 2 }}
        >
          {t("aboutTitle")}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Image
            src="/logo.png"
            alt="NLivri Lik Logo"
            width={220}
            height={220}
            style={{ borderRadius: "50%", boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
          />
        </Box>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="secondary.main"
          sx={{ mb: 3, letterSpacing: 1 }}
        >
          {t("heroSubtitle")}
        </Typography>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ maxWidth: 700, mx: "auto", fontSize: { xs: "1.1rem", md: "1.25rem" }, lineHeight: 1.8, background: "rgba(255,255,255,0.85)", p: 3, borderRadius: 3, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.04)" }}
        >
          {t("aboutDescription")}
        </Typography>
        {/* Carousel de photos */}
        <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt: 6, mb: 2 }}>
          <Slider
            infinite
            autoplay
            autoplaySpeed={2000}
            speed={800}
            slidesToShow={3}
            slidesToScroll={1}
            centerMode={false}
            centerPadding="0px"
            responsive={[
              { breakpoint: 1200, settings: { slidesToShow: 2 } },
              { breakpoint: 900, settings: { slidesToShow: 1 } }
            ]}
            arrows={true}
            pauseOnHover={false}
            cssEase="linear"
          >
            {aboutPhotos.map((src, idx) => (
              <Box
                key={src}
                sx={{
                  p: 1.5, // padding interne pour espacement
                  boxSizing: "border-box",
                  width: { xs: 260, sm: 280, md: 300 },
                  height: { xs: 220, sm: 250, md: 280 }, // hauteur augmentée
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent"
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 2px 16px 0 rgba(0,0,0,0.10)",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    background: "#fff",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    ':hover': { boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)", transform: "scale(1.03)" }
                  }}
                >
                  <Image
                    src={src}
                    alt={`about-photo-${idx}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 600px) 260px, (max-width: 900px) 280px, 300px"
                    priority={idx < 2}
                  />
                </Box>
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    </Container>
  );
}
