'use client';

import { motion } from 'framer-motion';
import { generateTowerStats, TowerType } from '@/lib/towerStats';

interface TowerMenuProps {
  products: string[];
  money: number;
  selectedTowerType: number | null;
  onSelectTower: (index: number | null) => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function TowerMenu({
  products,
  money,
  selectedTowerType,
  onSelectTower,
  primaryColor,
  secondaryColor,
  accentColor,
}: TowerMenuProps) {
  const towers = products.map((name, i) => generateTowerStats(name, i, accentColor));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-2xl p-4 w-64"
    >
      <h3 className="text-xs text-white/50 uppercase tracking-wider font-medium mb-4">
        Deploy Services
      </h3>

      <div className="space-y-3">
        {towers.map((tower, index) => {
          const canAfford = money >= tower.cost;
          const isSelected = selectedTowerType === index;

          return (
            <motion.button
              key={index}
              whileHover={{ scale: canAfford ? 1.02 : 1 }}
              whileTap={{ scale: canAfford ? 0.98 : 1 }}
              onClick={() => canAfford && onSelectTower(isSelected ? null : index)}
              className={`
                tower-card w-full p-3 rounded-xl text-left transition-all
                ${isSelected ? 'ring-2' : ''}
                ${canAfford ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}20)`
                  : 'rgba(255,255,255,0.03)',
                ringColor: isSelected ? accentColor : 'transparent',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Tower icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}30)`,
                    boxShadow: isSelected ? `0 0 20px ${primaryColor}40` : 'none',
                  }}
                >
                  {tower.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{tower.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{tower.description}</div>

                  {/* Stats */}
                  <div className="flex gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-white/30">DMG</span>
                      <span style={{ color: accentColor }}>{tower.damage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white/30">RNG</span>
                      <span style={{ color: primaryColor }}>{tower.range}</span>
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{ color: canAfford ? accentColor : '#ef4444' }}
                >
                  ${tower.cost}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/10 text-xs text-white/50 text-center"
                >
                  Click on the map to place
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedTowerType !== null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onSelectTower(null)}
          className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          Cancel Selection
        </motion.button>
      )}
    </motion.div>
  );
}
