"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";

export default function InfoDrawer() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        sx={{
          position: "fixed",
          top: "50%",
          right: 0,
          zIndex: 1300,
          transform: "translateY(-50%)",
          boxShadow: 3,
          writingMode: "sideways-lr",
          textOrientation: "mixed",
          minWidth: 36,
          padding: "8px 0",
          fontSize: "0.85rem",
        }}
        onClick={toggleDrawer(true)}
      >
        Voir plus d&apos;informations
      </Button>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: { xs: "90vw", sm: 400 },
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            sx={{ alignSelf: "flex-end", mb: 1 }}
            onClick={toggleDrawer(false)}
          >
            Fermer
          </Button>
          <Image
            src="/flyer.jpg"
            alt="Flyer NLivriLik"
            width={450}
            height={350}
            style={{
              width: "100%",
              maxWidth: 450,
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
              height: "auto",
            }}
            priority
          />
        </Box>
      </Drawer>
    </>
  );
}
