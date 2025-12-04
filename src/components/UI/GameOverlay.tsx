'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GameOverlayProps {
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  brandName: string;
  headline: string;
  score: number;
  wave: number;
  onStart: () => void;
  onRestart: () => void;
  onResume?: () => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

export function GameOverlay({
  status,
  brandName,
  headline,
  score,
  wave,
  onStart,
  onRestart,
  onResume,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
}: GameOverlayProps) {
  if (status === 'playing') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          className="text-center max-w-md px-8"
        >
          {/* Logo or brand initial */}
          {logoUrl ? (
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              src={logoUrl}
              alt={brandName}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl object-contain"
              style={{ boxShadow: `0 0 40px ${primaryColor}40` }}
            />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 0 40px ${primaryColor}40`,
              }}
            >
              {brandName.charAt(0)}
            </motion.div>
          )}

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm uppercase tracking-[0.3em] text-white/50 mb-2"
          >
            {brandName}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
            style={{
              background: `linear-gradient(135deg, #fff 0%, ${primaryColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {headline}
          </motion.h1>

          {/* Stats (for game over screens) */}
          {(status === 'won' || status === 'lost') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 mb-8"
            >
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Score</div>
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: accentColor }}
                >
                  {score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider">Wave</div>
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: primaryColor }}
                >
                  {wave}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col gap-3"
          >
            {status === 'idle' && (
              <button
                onClick={onStart}
                className="btn-primary text-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                Start Game
              </button>
            )}

            {status === 'paused' && (
              <>
                <button
                  onClick={onResume}
                  className="btn-primary text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  Resume
                </button>
                <button
                  onClick={onRestart}
                  className="py-3 px-8 text-white/60 hover:text-white transition-colors"
                >
                  Restart
                </button>
              </>
            )}

            {(status === 'won' || status === 'lost') && (
              <button
                onClick={onRestart}
                className="btn-primary text-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                Play Again
              </button>
            )}
          </motion.div>

          {/* Decorative elements */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
