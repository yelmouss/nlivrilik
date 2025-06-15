"use client";
import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";

export default function FramerTestComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("FramerTestComponent mounted");
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Test Framer Motion
      </Typography>
      
      {/* Test d'animation basique */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px 0'
        }}
      >
        <Typography variant="h6" color="white">
          Animation Basique (Fade In + Slide Up)
        </Typography>
      </motion.div>

      {/* Test d'animation hover */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          padding: '20px',
          borderRadius: '10px',
          margin: '20px 0',
          cursor: 'pointer'
        }}
      >
        <Typography variant="h6" color="white">
          Animation Hover (Passez la souris ici)
        </Typography>
      </motion.div>

      {/* Test d'animation infinie */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
          padding: '20px',
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          margin: '20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="body2" color="white">
          Rotation
        </Typography>
      </motion.div>
    </Box>
  );
}
