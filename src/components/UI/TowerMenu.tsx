'use client';

import { motion } from 'framer-motion';
import { generateTowerStats } from '@/lib/towerStats';

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
    <div className="space-y-2">
      {towers.map((tower, index) => {
        const canAfford = money >= tower.cost;
        const isSelected = selectedTowerType === index;

        return (
          <motion.button
            key={index}
            whileHover={{ scale: canAfford ? 1.01 : 1 }}
            whileTap={{ scale: canAfford ? 0.98 : 1 }}
            onClick={() => canAfford && onSelectTower(isSelected ? null : index)}
            className={`
              w-full p-3 rounded-xl text-left transition-all border-2
              ${canAfford ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
            `}
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}15)`
                : 'rgba(255,255,255,0.03)',
              borderColor: isSelected ? accentColor : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Tower icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}20)`,
                  boxShadow: isSelected ? `0 0 20px ${primaryColor}30` : 'none',
                }}
              >
                {tower.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base text-white truncate">{tower.name}</div>
                <div className="text-sm text-white/40 truncate">{tower.description}</div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-white/30">DMG</span>
                    <span style={{ color: accentColor }}>{tower.damage}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-white/30">RNG</span>
                    <span style={{ color: primaryColor }}>{tower.range}</span>
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div
                className="text-base font-bold tabular-nums shrink-0"
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
                Tap on the map to place
              </motion.div>
            )}
          </motion.button>
        );
      })}

      {selectedTowerType !== null && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onSelectTower(null)}
          className="w-full py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
        >
          Cancel Selection
        </motion.button>
      )}
    </div>
  );
}
