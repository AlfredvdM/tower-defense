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

  // Use tower-specific color, fallback to accent color
  const boltColor = projectile.color || accentColor;

  // Render continuous beam for max level towers
  if (projectile.isBeam && projectile.sourcePosition) {
    const sourceX = (projectile.sourcePosition.x / 100) * gameWidth;
    const sourceY = (projectile.sourcePosition.y / 100) * gameHeight;
    const targetX = x;
    const targetY = y;

    // Calculate beam length and angle
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const beamLength = Math.sqrt(dx * dx + dy * dy);
    const beamAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.05 }}
        className="absolute pointer-events-none"
        style={{
          left: sourceX,
          top: sourceY,
          transform: `rotate(${beamAngle}deg)`,
          transformOrigin: 'left center',
          zIndex: 25,
        }}
      >
        {/* Continuous beam */}
        <div
          className="relative"
          style={{
            width: beamLength,
            height: '8px',
            marginTop: '-4px',
          }}
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${boltColor}80 0%, ${boltColor} 10%, ${boltColor} 90%, ${boltColor}80 100%)`,
              filter: 'blur(4px)',
              boxShadow: `0 0 20px ${boltColor}, 0 0 40px ${boltColor}80`,
            }}
          />

          {/* Core beam */}
          <div
            className="absolute"
            style={{
              top: '2px',
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${boltColor} 0%, #fff 20%, #fff 80%, ${boltColor} 100%)`,
              boxShadow: `0 0 10px #fff, 0 0 20px ${boltColor}`,
            }}
          />

          {/* Inner white core */}
          <div
            className="absolute"
            style={{
              top: '3px',
              left: '5%',
              right: '5%',
              height: '2px',
              background: '#fff',
              boxShadow: '0 0 5px #fff',
            }}
          />

          {/* Impact point glow */}
          <div
            className="absolute"
            style={{
              right: '-10px',
              top: '-6px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: `radial-gradient(circle, #fff 0%, ${boltColor} 40%, transparent 70%)`,
              boxShadow: `0 0 20px ${boltColor}, 0 0 40px ${boltColor}`,
            }}
          />
        </div>
      </motion.div>
    );
  }

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
        className="relative laser-bolt"
        style={{
          width: '55px',
          height: '4px',
        }}
      >
        {/* Core - bright white/yellow center */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: '2px',
            background: `linear-gradient(90deg,
              transparent 0%,
              ${boltColor} 10%,
              #fff 30%,
              #fff 70%,
              ${boltColor} 90%,
              transparent 100%
            )`,
            boxShadow: `
              0 0 4px #fff,
              0 0 8px ${boltColor},
              0 0 16px ${boltColor},
              0 0 32px ${boltColor}80,
              0 0 48px ${boltColor}40
            `,
          }}
        />

        {/* Inner white core (narrower) */}
        <div
          className="absolute"
          style={{
            top: '1px',
            left: '20%',
            right: '20%',
            height: '2px',
            borderRadius: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #fff 20%, #fff 80%, transparent 100%)',
            boxShadow: '0 0 3px #fff',
          }}
        />

        {/* Outer glow bloom */}
        <div
          className="absolute -inset-2 rounded-full opacity-50"
          style={{
            background: `radial-gradient(ellipse 100% 200%, ${boltColor}60 0%, transparent 60%)`,
            filter: 'blur(3px)',
          }}
        />

        {/* Trail effect */}
        <div
          className="absolute top-1/2 right-full -translate-y-1/2"
          style={{
            width: '40px',
            height: '3px',
            borderRadius: '1px 0 0 1px',
            background: `linear-gradient(90deg, transparent 0%, ${boltColor}30 40%, ${boltColor}80 100%)`,
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
