'use client';

import { motion } from 'framer-motion';
import { Tower } from '@/types/game';
import { getUpgradeCost } from '@/lib/towerStats';

interface TowerActionPopupProps {
  tower: Tower;
  money: number;
  onUpgrade: () => void;
  onMove: () => void;
  onCancel: () => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gameWidth: number;
  gameHeight: number;
  isMobile?: boolean;
}

export function TowerActionPopup({
  tower,
  money,
  onUpgrade,
  onMove,
  onCancel,
  primaryColor,
  secondaryColor,
  accentColor,
  gameWidth,
  gameHeight,
  isMobile = false,
}: TowerActionPopupProps) {
  // Calculate tower position in pixels
  const towerX = (tower.position.x / 100) * gameWidth;
  const towerY = (tower.position.y / 100) * gameHeight;

  // Popup dimensions (approximate)
  const popupHeight = 180;
  const towerRadius = 40; // Half of tower size + some padding

  // Determine if popup should appear above or below
  // Show below if tower is in top 30% of game area
  const showBelow = towerY < popupHeight + towerRadius + 20;

  const upgradeCost = getUpgradeCost(tower.cost, tower.level);
  const canAffordUpgrade = money >= upgradeCost;
  const isMaxLevel = tower.level >= 5;

  // Calculate final popup position
  const popupY = showBelow
    ? towerY + towerRadius + 15  // Below tower
    : towerY - towerRadius - 15; // Above tower

  // On mobile, center the popup in the game area
  const mobileStyle = isMobile
    ? {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {
        left: towerX,
        top: popupY,
        transform: showBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute z-[200] pointer-events-auto"
      style={mobileStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-xl p-3 min-w-[220px] relative"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(30, 30, 50, 0.85) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 30px ${primaryColor}20
          `,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
          <span className="text-white font-semibold text-sm">{tower.name}</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: isMaxLevel ? `${accentColor}40` : `${primaryColor}30`,
              color: isMaxLevel ? accentColor : 'white',
            }}
          >
            {isMaxLevel ? 'MAX' : `LVL ${tower.level}`}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center p-1.5 rounded-lg bg-white/5">
            <div className="text-white/50 text-[10px] uppercase tracking-wide">DMG</div>
            <div className="text-white font-mono font-semibold">{tower.damage}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-white/5">
            <div className="text-white/50 text-[10px] uppercase tracking-wide">RNG</div>
            <div className="text-white font-mono font-semibold">{tower.range}</div>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-white/5">
            <div className="text-white/50 text-[10px] uppercase tracking-wide">SPD</div>
            <div className="text-white font-mono font-semibold">{(1000 / tower.fireRate).toFixed(1)}/s</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Upgrade button */}
          {!isMaxLevel ? (
            <button
              onClick={onUpgrade}
              disabled={!canAffordUpgrade}
              className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background: canAffordUpgrade
                  ? `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                  : 'rgba(255,255,255,0.08)',
                color: 'white',
                boxShadow: canAffordUpgrade ? `0 4px 15px ${primaryColor}40` : 'none',
              }}
            >
              Upgrade ${upgradeCost}
            </button>
          ) : (
            <div
              className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs text-center"
              style={{
                background: `${accentColor}20`,
                color: accentColor,
              }}
            >
              Maxed Out
            </div>
          )}

          {/* Move button */}
          <button
            onClick={onMove}
            className="flex-1 py-2.5 px-3 rounded-lg font-semibold text-xs transition-all
                     hover:bg-white/15 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Move
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full mt-2 py-1.5 rounded-lg text-white/40 text-xs hover:text-white/60
                   hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>

        {/* Arrow pointing to tower - hidden on mobile */}
        {!isMobile && (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3"
            style={{
              [showBelow ? 'top' : 'bottom']: '-6px',
              transform: `translateX(-50%) rotate(${showBelow ? '225' : '45'}deg)`,
              background: 'linear-gradient(135deg, transparent 50%, rgba(20, 20, 35, 0.9) 50%)',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
