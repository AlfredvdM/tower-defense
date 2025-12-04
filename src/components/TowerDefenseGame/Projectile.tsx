'use client';

import { motion } from 'framer-motion';
import { Projectile as ProjectileType } from '@/types/game';

interface ProjectileProps {
  projectile: ProjectileType;
  accentColor: string;
  primaryColor: string;
  gameWidth: number;
  gameHeight: number;
}

export function Projectile({ projectile, accentColor, primaryColor, gameWidth, gameHeight }: ProjectileProps) {
  const x = (projectile.position.x / 100) * gameWidth;
  const y = (projectile.position.y / 100) * gameHeight;

  // Calculate rotation based on velocity direction
  const angle = Math.atan2(projectile.velocityY || 0, projectile.velocityX || 0) * (180 / Math.PI);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        zIndex: 25,
      }}
    >
      {/* Main laser bolt - Star Wars style */}
      <div
        className="relative"
        style={{
          width: '24px',
          height: '6px',
        }}
      >
        {/* Core - bright white/yellow center */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${accentColor} 20%,
              #fff 40%,
              #fff 60%,
              ${accentColor} 80%,
              transparent 100%
            )`,
            boxShadow: `
              0 0 4px #fff,
              0 0 8px ${accentColor},
              0 0 16px ${accentColor},
              0 0 32px ${accentColor}80
            `,
          }}
        />

        {/* Outer glow */}
        <div
          className="absolute -inset-1 rounded-full opacity-60"
          style={{
            background: `radial-gradient(ellipse, ${accentColor}80 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />

        {/* Trail effect */}
        <div
          className="absolute top-1/2 right-full -translate-y-1/2"
          style={{
            width: '30px',
            height: '4px',
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 50%, ${accentColor} 100%)`,
            filter: 'blur(1px)',
          }}
        />
      </div>
    </motion.div>
  );
}

// Explosion effect component
export function Explosion({
  x,
  y,
  color,
  gameWidth,
  gameHeight,
  onComplete
}: {
  x: number;
  y: number;
  color: string;
  gameWidth: number;
  gameHeight: number;
  onComplete: () => void;
}) {
  const pixelX = (x / 100) * gameWidth;
  const pixelY = (y / 100) * gameHeight;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none"
      style={{
        left: pixelX,
        top: pixelY,
        transform: 'translate(-50%, -50%)',
        zIndex: 30,
      }}
    >
      {/* Explosion rings */}
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, ${color}80 30%, transparent 70%)`,
          boxShadow: `0 0 30px ${color}, 0 0 60px ${color}80`,
        }}
      />

      {/* Particle burst */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 25;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-4px',
              marginTop: '-4px',
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
            }}
          />
        );
      })}

      {/* Flash */}
      <motion.div
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 1, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          background: `radial-gradient(circle, #fff 0%, ${color} 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  );
}
