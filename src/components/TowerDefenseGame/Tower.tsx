'use client';

import { motion } from 'framer-motion';
import { Tower as TowerType, Enemy } from '@/types/game';

interface TowerProps {
  tower: TowerType;
  isSelected: boolean;
  showRange: boolean;
  onClick: () => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gameWidth: number;
  gameHeight: number;
  targetEnemy?: Enemy | null;
  isMobile?: boolean;
}

export function Tower({
  tower,
  isSelected,
  showRange,
  onClick,
  primaryColor,
  secondaryColor,
  accentColor,
  gameWidth,
  gameHeight,
  targetEnemy,
  isMobile = false,
}: TowerProps) {
  // Convert percentage to pixels
  const x = (tower.position.x / 100) * gameWidth;
  const y = (tower.position.y / 100) * gameHeight;

  // Calculate rotation to face target enemy
  let rotation = 0;
  let beamLength = 0;
  if (targetEnemy) {
    const dx = targetEnemy.position.x - tower.position.x;
    const dy = targetEnemy.position.y - tower.position.y;
    rotation = Math.atan2(dy, dx) * (180 / Math.PI);
    // Calculate beam length in pixels for max level towers
    const dxPx = ((targetEnemy.position.x - tower.position.x) / 100) * gameWidth;
    const dyPx = ((targetEnemy.position.y - tower.position.y) / 100) * gameHeight;
    beamLength = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
  }

  // Check if tower just fired (within last 200ms)
  const justFired = Date.now() - tower.lastFired < 200;

  // Calculate scale and glow based on level
  const baseScale = isMobile ? 0.75 : 1; // 48px on mobile (64 * 0.75), 64px on desktop
  const towerScale = baseScale * (1 + (tower.level - 1) * 0.1);
  const glowIntensity = tower.level * 0.15;
  const isMaxLevel = tower.level >= 5;
  const boltColor = tower.color || accentColor;

  // Sizes based on mobile/desktop
  const centerOffset = isMobile ? 24 : 32; // Half of tower size for centering

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      className="absolute cursor-pointer"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 100 : 50,
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Range indicator */}
      {(showRange || isSelected) && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute rounded-full range-pulse pointer-events-none"
          style={{
            width: tower.range * 2,
            height: tower.range * 2,
            left: centerOffset,
            top: centerOffset,
            transform: 'translate(-50%, -50%)',
            border: `2px solid ${primaryColor}`,
            background: `radial-gradient(circle, ${primaryColor}10 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Continuous beam for upgraded towers (level 2+) */}
      {tower.level >= 2 && targetEnemy && beamLength > 0 && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: centerOffset,
            top: centerOffset,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'left center',
            zIndex: 200,
          }}
        >
          {/* Beam container */}
          <div
            className="relative"
            style={{
              width: beamLength,
              height: '12px',
              marginTop: '-6px',
            }}
          >
            {/* Outer glow - widest layer */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, ${boltColor}60 0%, ${boltColor}90 10%, ${boltColor}90 90%, ${boltColor}60 100%)`,
                filter: 'blur(8px)',
                boxShadow: `0 0 30px ${boltColor}, 0 0 60px ${boltColor}60`,
              }}
            />

            {/* Middle glow layer */}
            <div
              className="absolute"
              style={{
                top: '2px',
                left: 0,
                right: 0,
                height: '8px',
                background: `linear-gradient(90deg, ${boltColor} 0%, ${boltColor} 100%)`,
                filter: 'blur(3px)',
                boxShadow: `0 0 15px ${boltColor}`,
              }}
            />

            {/* Core beam - bright center */}
            <div
              className="absolute"
              style={{
                top: '4px',
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${boltColor} 0%, #fff 15%, #fff 85%, ${boltColor} 100%)`,
                boxShadow: `0 0 10px #fff, 0 0 20px ${boltColor}`,
              }}
            />

            {/* Inner white-hot core */}
            <div
              className="absolute"
              style={{
                top: '5px',
                left: '3%',
                right: '3%',
                height: '2px',
                background: '#fff',
                boxShadow: '0 0 8px #fff',
              }}
            />

            {/* Animated energy particles along beam */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: '3px',
                left: 0,
                right: 0,
                height: '6px',
              }}
            >
              <div
                className="absolute h-full"
                style={{
                  width: '200%',
                  background: `repeating-linear-gradient(90deg, transparent 0px, transparent 10px, rgba(255,255,255,0.4) 12px, transparent 14px)`,
                  animation: 'beam-flow 0.3s linear infinite',
                }}
              />
            </div>

            {/* Impact point glow at target */}
            <div
              className="absolute"
              style={{
                right: '-15px',
                top: '-9px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: `radial-gradient(circle, #fff 0%, ${boltColor} 30%, transparent 70%)`,
                boxShadow: `0 0 25px ${boltColor}, 0 0 50px ${boltColor}80`,
                animation: 'impact-pulse 0.15s ease-in-out infinite',
              }}
            />

            {/* Source point glow at tower */}
            <div
              className="absolute"
              style={{
                left: '-8px',
                top: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: `radial-gradient(circle, #fff 0%, ${boltColor} 50%, transparent 80%)`,
                boxShadow: `0 0 15px ${boltColor}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Tower base */}
      <div
        className="relative w-16 h-16 rounded-full transition-transform duration-300"
        style={{
          transform: `scale(${towerScale})`,
          background: isMaxLevel
            ? `radial-gradient(circle at 30% 30%, ${accentColor}90, ${primaryColor}70)`
            : `radial-gradient(circle at 30% 30%, ${primaryColor}90, ${secondaryColor}70)`,
          boxShadow: isSelected
            ? `0 0 ${30 + tower.level * 10}px ${primaryColor}60, 0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)`
            : tower.level > 1
            ? `0 0 ${tower.level * 8}px ${tower.color || primaryColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, 0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)`
            : `0 4px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)`,
          border: `3px solid ${isSelected ? accentColor : isMaxLevel ? accentColor : 'rgba(255,255,255,0.3)'}`,
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)`,
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* Turret (rotates to face enemy) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Gun barrel */}
          <div
            className="absolute w-8 h-3 rounded-r-full"
            style={{
              left: '50%',
              background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})`,
              boxShadow: justFired
                ? `0 0 15px ${accentColor}, 0 0 30px ${accentColor}80`
                : `0 2px 4px rgba(0,0,0,0.3)`,
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {/* Muzzle flash when firing */}
            {justFired && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, #fff 0%, ${accentColor} 50%, transparent 100%)`,
                  boxShadow: `0 0 20px ${accentColor}`,
                }}
              />
            )}
          </div>

          {/* Center dot */}
          <div
            className="w-4 h-4 rounded-full z-10"
            style={{
              background: `radial-gradient(circle, #fff 0%, ${accentColor} 100%)`,
              boxShadow: `0 0 10px ${accentColor}80`,
            }}
          />
        </motion.div>

        {/* Level indicator */}
        {tower.level > 1 && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center z-20"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          >
            {tower.level}
          </div>
        )}

        {/* Tower initial in center */}
        <div
          className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80 z-10"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          {tower.name.charAt(0)}
        </div>

        {/* Fire pulse effect */}
        {justFired && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${accentColor}`,
              boxShadow: `0 0 20px ${accentColor}`,
            }}
          />
        )}
      </div>

      {/* Tower name label */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                   text-sm font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
          color: '#fff',
          border: `1px solid ${primaryColor}40`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {tower.name}
      </div>
    </motion.div>
  );
}
