'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialOverlayProps {
  step: 1 | 2 | 3;
  onNext: () => void;
  onSkip: () => void;
  onStart: () => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isMobile: boolean;
}

const tutorialContent = {
  1: {
    title: 'The Path',
    text: 'Enemies travel along this glowing path toward your base',
  },
  2: {
    title: 'Your Defenses',
    text: 'Select a tower and tap the field to place it',
  },
  3: {
    title: 'Protect Your Base',
    text: 'Don\'t let enemies through — watch your lives!',
  },
};

export function TutorialOverlay({
  step,
  onNext,
  onSkip,
  onStart,
  primaryColor,
  secondaryColor,
  accentColor,
  isMobile,
}: TutorialOverlayProps) {
  const content = tutorialContent[step];
  const isLastStep = step === 3;

  // Track window size for line positioning
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Card dimensions
  const cardWidth = 280;
  const cardHeight = 180;

  // Card position - Desktop: right of sidebar, Mobile: centered
  const getCardPosition = () => {
    if (isMobile) {
      return {
        left: (windowSize.width - cardWidth) / 2,
        bottom: 140,
      };
    }
    return {
      left: 300, // Right of 280px sidebar + 20px gap
      bottom: 20,
    };
  };

  const cardPos = getCardPosition();

  // Line start point (from LEFT edge of card on desktop, bottom on mobile)
  const getLineStart = () => {
    if (isMobile) {
      // From bottom center of card
      return {
        x: cardPos.left + cardWidth / 2,
        y: windowSize.height - cardPos.bottom,
      };
    }
    // From left edge of card (middle height)
    return {
      x: cardPos.left,
      y: windowSize.height - cardPos.bottom - cardHeight / 2,
    };
  };

  const lineStart = getLineStart();

  // Target point based on step and device
  const getTargetPoint = () => {
    if (isMobile) {
      switch (step) {
        case 1: // Path - center of game
          return { x: windowSize.width * 0.5, y: windowSize.height * 0.35 };
        case 2: // Tower bar - bottom center
          return { x: windowSize.width * 0.5, y: windowSize.height - 50 };
        case 3: // Lives - top left HUD
          return { x: 70, y: 25 };
        default:
          return { x: windowSize.width * 0.5, y: windowSize.height * 0.5 };
      }
    } else {
      switch (step) {
        case 1: // Path - center of game board
          return { x: windowSize.width * 0.65, y: windowSize.height * 0.5 };
        case 2: // Deploy section - left panel
          return { x: 150, y: windowSize.height * 0.7 };
        case 3: // Lives - left panel, upper area
          return { x: 150, y: 160 };
        default:
          return { x: windowSize.width * 0.5, y: windowSize.height * 0.5 };
      }
    }
  };

  const target = getTargetPoint();

  return (
    <>
      {/* SVG Connector Line */}
      <svg
        className="fixed inset-0 z-[54] pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glowing line */}
        <motion.line
          key={step}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          x1={lineStart.x}
          y1={lineStart.y}
          x2={target.x}
          y2={target.y}
          stroke={accentColor}
          strokeWidth="2"
          strokeDasharray="8 4"
          filter="url(#lineGlow)"
        />

        {/* Target dot */}
        <motion.circle
          key={`dot-${step}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.4, 1], opacity: 1 }}
          transition={{
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.3 }
          }}
          cx={target.x}
          cy={target.y}
          r="10"
          fill={accentColor}
          filter="url(#lineGlow)"
        />
      </svg>

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed z-[55]"
          style={{
            left: cardPos.left,
            bottom: cardPos.bottom,
            width: cardWidth,
          }}
        >
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(15,15,25,0.97) 0%, rgba(10,10,18,0.99) 100%)',
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 30px ${accentColor}50, 0 0 60px ${accentColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: s === step
                        ? accentColor
                        : 'rgba(255,255,255,0.2)',
                      boxShadow: s === step ? `0 0 8px ${accentColor}` : 'none',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={onSkip}
                className="text-white/40 hover:text-white/70 text-xs transition-colors"
              >
                Skip
              </button>
            </div>

            {/* Title */}
            <h3
              className="text-base font-bold mb-1"
              style={{ color: accentColor }}
            >
              {content.title}
            </h3>

            {/* Description */}
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              {content.text}
            </p>

            {/* Action button */}
            <button
              onClick={isLastStep ? onStart : onNext}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{
                background: accentColor,
                boxShadow: `0 0 20px ${accentColor}40`,
              }}
            >
              {isLastStep ? 'Got It!' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
