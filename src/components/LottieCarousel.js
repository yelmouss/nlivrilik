'use client';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import the animation data
import animationHero from '../../public/AnimationHero.json';
import animationService1 from '../../public/AnimationService1.json';
import animationService2 from '../../public/AnimationService2.json';
import animationServices from '../../public/AnimationServices.json';

const animations = [
  { id: 1, data: animationHero },
  { id: 2, data: animationService1 },
  { id: 3, data: animationService2 },
//   { id: 4, data: animationServices },
];

export default function LottieCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Effect to handle the animation rotation
  useEffect(() => {
    // Start the interval to change animations every 3 seconds
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % animations.length);
    }, 3000);

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: 150,
        overflow: 'hidden',
        position: 'relative',
        mt: 2,
        mb: 1,
        borderRadius: '8px',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Lottie
            animationData={animations[currentIndex].data}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
