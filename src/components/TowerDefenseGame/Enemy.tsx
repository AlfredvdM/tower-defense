'use client';

import { motion } from 'framer-motion';
import { Enemy as EnemyType } from '@/types/game';

interface EnemyProps {
  enemy: EnemyType;
  gameWidth: number;
  gameHeight: number;
}

export function Enemy({ enemy, gameWidth, gameHeight }: EnemyProps) {
  const x = (enemy.position.x / 100) * gameWidth;
  const y = (enemy.position.y / 100) * gameHeight;
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  // Use enemy color from type, fallback to red
  const enemyColor = enemy.color || '#ef4444';

  // Determine enemy size based on health (larger enemies for higher health)
  const size = enemy.maxHealth > 200 ? 42 : enemy.maxHealth > 100 ? 36 : enemy.maxHealth > 60 ? 28 : 24;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: x,
        y: y,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        x: { duration: 0.1, ease: 'linear' },
        y: { duration: 0.1, ease: 'linear' },
        scale: { type: 'spring', damping: 15 },
      }}
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
      }}
    >
      {/* Enemy body */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${enemyColor}dd, ${enemyColor})`,
          boxShadow: `
            0 0 20px ${enemyColor}80,
            inset 0 -3px 6px rgba(0,0,0,0.3),
            inset 0 3px 6px rgba(255,255,255,0.2)
          `,
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-1 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)',
          }}
        />

        {/* Eyes */}
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full" />
      </motion.div>

      {/* Health bar */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 health-bar"
        style={{ width: size + 8 }}
      >
        <motion.div
          className="health-bar-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${healthPercent}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Damage flash */}
      {enemy.health < enemy.maxHealth && (
        <motion.div
          key={enemy.health}
          initial={{ opacity: 0.8, scale: 1.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-full bg-white pointer-events-none"
        />
      )}
    </motion.div>
  );
}
