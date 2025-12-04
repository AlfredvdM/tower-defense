'use client';

import { motion } from 'framer-motion';

interface FloatingTextProps {
  x: number;
  y: number;
  amount: number;
  color: string;
  gameWidth: number;
  gameHeight: number;
  onComplete: () => void;
}

export function FloatingText({
  x,
  y,
  amount,
  color,
  gameWidth,
  gameHeight,
  onComplete,
}: FloatingTextProps) {
  // Convert percentage to pixels
  const pixelX = (x / 100) * gameWidth;
  const pixelY = (y / 100) * gameHeight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], y: -40, scale: 1 }}
      transition={{ duration: 1, times: [0, 0.1, 0.7, 1] }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none font-bold text-lg"
      style={{
        left: pixelX,
        top: pixelY,
        transform: 'translate(-50%, -50%)',
        color: color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 2px 4px rgba(0,0,0,0.8)`,
        zIndex: 50,
      }}
    >
      +${amount}
    </motion.div>
  );
}
