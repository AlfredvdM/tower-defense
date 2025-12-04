'use client';

import { motion } from 'framer-motion';

interface ResourceBarProps {
  money: number;
  lives: number;
  score: number;
  primaryColor: string;
  accentColor: string;
}

export function ResourceBar({ money, lives, score, primaryColor, accentColor }: ResourceBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-8"
    >
      {/* Money */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          $
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider font-medium">Credits</div>
          <motion.div
            key={money}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold tabular-nums"
            style={{ color: accentColor }}
          >
            {money.toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Lives */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider font-medium">Lives</div>
          <motion.div
            key={lives}
            initial={{ scale: 1.2, color: '#ef4444' }}
            animate={{ scale: 1, color: lives <= 5 ? '#ef4444' : '#fff' }}
            className="text-xl font-bold tabular-nums"
          >
            {lives}
          </motion.div>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider font-medium">Score</div>
          <div className="text-xl font-bold tabular-nums" style={{ color: primaryColor }}>
            {score.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
