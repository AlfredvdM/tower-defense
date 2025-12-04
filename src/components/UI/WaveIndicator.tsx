'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface WaveIndicatorProps {
  currentWave: number;
  totalWaves: number;
  primaryColor: string;
  accentColor: string;
  countdown: number;
  isWaveActive: boolean;
  enemyCount?: number;
}

export function WaveIndicator({
  currentWave,
  totalWaves,
  primaryColor,
  accentColor,
  countdown,
  isWaveActive,
  enemyCount = 0,
}: WaveIndicatorProps) {
  const progress = (currentWave / totalWaves) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-2xl p-4 min-w-[200px]"
    >
      {/* Wave title and counter */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">Wave</span>
        <span
          className="wave-badge text-lg font-bold"
          style={{ color: primaryColor }}
        >
          {currentWave}/{totalWaves}
        </span>
      </div>

      {/* Countdown or Status */}
      <AnimatePresence mode="wait">
        {countdown > 0 ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-2"
          >
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
              Wave starts in
            </div>
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold"
              style={{ color: accentColor }}
            >
              {countdown}
            </motion.div>
          </motion.div>
        ) : isWaveActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#ef4444' }}
            />
            <span className="text-sm font-medium text-white/70">
              {enemyCount > 0 ? `${enemyCount} enemies remaining` : 'Wave in progress'}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-2"
          >
            <span className="text-sm text-green-400 font-medium">Wave Complete!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80)`,
            boxShadow: `0 0 10px ${primaryColor}60`,
          }}
        />
      </div>

      {/* Wave markers */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: Math.min(totalWaves, 10) }).map((_, i) => {
          const waveNum = totalWaves <= 10 ? i + 1 : Math.floor((i / 9) * (totalWaves - 1)) + 1;
          return (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: waveNum <= currentWave ? primaryColor : 'rgba(255,255,255,0.2)',
                boxShadow: waveNum <= currentWave ? `0 0 6px ${primaryColor}` : 'none',
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
