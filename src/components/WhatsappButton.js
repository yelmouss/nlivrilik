"use client";
import React from "react";
import IconButton from "@mui/material/IconButton";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Box from "@mui/material/Box";

const whatsappNumber = "212752904926";
const whatsappUrl = `https://wa.me/${whatsappNumber}`;

export default function WhatsappButton() {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <IconButton
        component="a"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: "#25D366",
          color: "white",
          boxShadow: 3,
          width: 64,
          height: 64,
          '&:hover': {
            backgroundColor: "#128C7E",
          },
        }}
        aria-label="Contacter sur WhatsApp"
      >
        <WhatsAppIcon sx={{ fontSize: 40 }} />
      </IconButton>
    </Box>
  );
}
