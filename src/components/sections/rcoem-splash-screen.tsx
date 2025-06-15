"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface RcoemSplashScreenProps {
  onComplete?: () => void;
  children?: React.ReactNode;
}

const RcoemSplashScreen: React.FC<RcoemSplashScreenProps> = ({ onComplete, children }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'lines-exit' | 'content-zoom' | 'complete'>('initial');
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 }); // Default fallback

  // Track window size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    updateWindowSize();

    // Add resize listener
    window.addEventListener('resize', updateWindowSize);

    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  useEffect(() => {

    // Phase 1: Initial appearance (0-4.6s) - Wait for all animations to complete + 2s pause
    const initialTimer = setTimeout(() => {
      setAnimationPhase('lines-exit');
    }, 3000); // Bottom line completes at 2s + 1s wait = 3s

    // Phase 2: Lines slide out AND content zoom simultaneously (3s-3.6s)
    const linesExitTimer = setTimeout(() => {
      setAnimationPhase('content-zoom');
    }, 3000); // Start immediately with lines-exit

    // Phase 3: Complete animation (3.6s) - Right when text zoom finishes
    const contentZoomTimer = setTimeout(() => {
      setAnimationPhase('complete');
      setIsAnimating(false);
      setShowApp(true);
      onComplete?.();
    }, 3600); // Text zoom starts at 3s + 0.6s duration = 3.6s

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(linesExitTimer);
      clearTimeout(contentZoomTimer);
    };
  }, [onComplete]);

  // Animation variants for lines - using dynamic windowSize with responsive scaling
  const leftLineVariants = {
    initial: { width: 0, x: 0, opacity: 0 },
    expanded: { 
      width: windowSize.width >= 768 ? 120 : 60, // Double width for desktop
      x: windowSize.width >= 768 ? -60 : -30, // Double offset for desktop
      opacity: 1,
      transition: { duration: 0.8, delay: 0.6, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: { 
      x: -windowSize.width, 
      opacity: 0,
      transition: { duration: 1, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  const rightLineVariants = {
    initial: { width: 0, x: 0, opacity: 0 },
    expanded: { 
      width: windowSize.width >= 768 ? 120 : 60, // Double width for desktop
      x: windowSize.width >= 768 ? 60 : 30, // Double offset for desktop
      opacity: 1,
      transition: { duration: 0.8, delay: 0.6, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: { 
      x: windowSize.width, 
      opacity: 0,
      transition: { duration: 1, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  const bottomLineVariants = {
    initial: { width: 0, opacity: 0 },
    expanded: { 
      width: windowSize.width >= 768 ? 240 : 120, // Double width for desktop
      opacity: 1,
      transition: { duration: 1, delay: 1.6, ease: [0.4, 0.0, 0.2, 1] }
    },
    exit: { 
      y: windowSize.height, 
      opacity: 0,
      transition: { duration: 1, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  // Animation variants for central content
  const logoVariants = {
    initial: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.4, ease: [0.4, 0.0, 0.2, 1] }
    },
    fadeOut: { 
      opacity: 0,
      transition: { duration: 1, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 20, scale: 1 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.8, delay: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    },
    zoom: { 
      scale: 50, 
      opacity: 0,
      color: "#000000", // Change to black during zoom
      transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  const containerVariants = {
    initial: { opacity: 1 },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Main App Content */}
      <AnimatePresence>
        {showApp && (
          <motion.div 
            className="w-full h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            variants={containerVariants}
            initial="initial"
            exit="exit"
          >
            {/* Background Reveal */}
            <motion.div 
              className="absolute inset-0 bg-black"
              initial={{ clipPath: 'inset(0 50% 0 50%)' }}
              animate={{ clipPath: 'inset(0 0% 0 0%)' }}
              transition={{ duration: 1.6, ease: [0.4, 0.0, 0.2, 1] }}
            />

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              
              {/* Logo and Lines Row */}
              <div className="flex items-center mb-2">
                {/* Left Line */}
                <motion.div 
                  className="bg-white h-1 rounded-sm"
                  variants={leftLineVariants}
                  initial="initial"
                  animate={animationPhase === 'initial' ? 'expanded' : animationPhase === 'lines-exit' ? 'exit' : 'exit'}
                />

                {/* Central Logo Container */}
                <motion.div 
                  className="mx-8 md:mx-12"
                  variants={logoVariants}
                  initial="initial"
                  animate={animationPhase === 'initial' || animationPhase === 'lines-exit' ? 'visible' : 'fadeOut'}
                >
                  <Image
                    src="/logo192.png"
                    alt="RBU Logo"
                    width={192}
                    height={192}
                    className="h-16 w-auto object-contain md:h-24" // Larger on desktop
                    priority
                  />
                </motion.div>

                {/* Right Line */}
                <motion.div 
                  className="bg-white h-1 rounded-sm"
                  variants={rightLineVariants}
                  initial="initial"
                  animate={animationPhase === 'initial' ? 'expanded' : animationPhase === 'lines-exit' ? 'exit' : 'exit'}
                />
              </div>

              {/* TBI Text */}
              <motion.div 
                className="flex items-center text-white font-black tracking-wider text-4xl md:text-6xl" // Larger text on desktop
                style={{ fontFamily: 'Arial Black, sans-serif' }}
                variants={textVariants}
                initial="initial"
                animate={animationPhase === 'initial' || animationPhase === 'lines-exit' ? 'visible' : 'zoom'}
              >
                TBI
              </motion.div>

              {/* Bottom Line */}
              <motion.div 
                className="mt-6 bg-white h-0.5 rounded-sm"
                variants={bottomLineVariants}
                initial="initial"
                animate={animationPhase === 'initial' ? 'expanded' : animationPhase === 'lines-exit' ? 'exit' : 'exit'}
              />
            </div>

            {/* Radial Pulse Effect */}
            <motion.div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RcoemSplashScreen;