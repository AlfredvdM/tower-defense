'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PathPoint } from '@/types/game';
import { pathToSvg, isOnPath } from '@/lib/pathGeneration';

interface GameBoardProps {
  path: PathPoint[];
  width: number;
  height: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  brandName: string;
  selectedTowerType: number | null;
  selectedTowerId: string | null;
  onPlaceTower: (x: number, y: number) => void;
  onMoveTower: (towerId: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export function GameBoard({
  path,
  width,
  height,
  primaryColor,
  secondaryColor,
  accentColor,
  logoUrl,
  brandName,
  selectedTowerType,
  selectedTowerId,
  onPlaceTower,
  onMoveTower,
  children,
}: GameBoardProps) {
  const pathData = useMemo(() => pathToSvg(path), [path]);

  // Grid for tower placement
  const gridCols = 16;
  const gridRows = 12;

  const handleCellClick = useCallback(
    (col: number, row: number) => {
      const x = ((col + 0.5) / gridCols) * 100;
      const y = ((row + 0.5) / gridRows) * 100;

      // Check if position is on path
      if (isOnPath({ x, y }, path, 8)) return;

      // If a tower is selected, move it
      if (selectedTowerId) {
        onMoveTower(selectedTowerId, x, y);
        return;
      }

      // If a tower type is selected, place a new tower
      if (selectedTowerType !== null) {
        onPlaceTower(x, y);
      }
    },
    [selectedTowerType, selectedTowerId, path, onPlaceTower, onMoveTower, gridCols, gridRows]
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        width,
        height,
        background: `
          radial-gradient(ellipse at 20% 30%, ${primaryColor}15 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, ${secondaryColor}10 0%, transparent 50%),
          linear-gradient(135deg, #0a0a12 0%, #12121a 50%, #0a0a12 100%)
        `,
        boxShadow: `
          0 0 60px ${primaryColor}20,
          inset 0 0 100px rgba(0,0,0,0.5)
        `,
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Enemy path (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Path glow */}
        <defs>
          <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.6" />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Main path */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#pathGlow)"
        />

        {/* Path border */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>

      {/* Spawn point indicator */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-8 h-8 rounded-full"
        style={{
          left: `${path[0].x}%`,
          top: `${path[0].y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${primaryColor}60 0%, transparent 70%)`,
          boxShadow: `0 0 20px ${primaryColor}40`,
        }}
      />

      {/* Base (goal) - Company logo or initial */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px ${accentColor}40`,
            `0 0 40px ${accentColor}60`,
            `0 0 20px ${accentColor}40`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-16 h-16 rounded-xl flex items-center justify-center"
        style={{
          left: `${path[path.length - 1].x}%`,
          top: `${path[path.length - 1].y}%`,
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
          border: `2px solid ${accentColor}60`,
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brandName}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span className="text-2xl font-bold" style={{ color: accentColor }}>
            {brandName.charAt(0)}
          </span>
        )}
      </motion.div>

      {/* Placement grid (visible when placing new tower or moving existing tower) */}
      {(selectedTowerType !== null || selectedTowerId !== null) && (
        <div
          className="placement-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          }}
        >
          {Array.from({ length: gridCols * gridRows }).map((_, i) => {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const x = ((col + 0.5) / gridCols) * 100;
            const y = ((row + 0.5) / gridRows) * 100;
            const isInvalid = isOnPath({ x, y }, path, 8);

            return (
              <div
                key={i}
                className={`placement-cell ${isInvalid ? 'invalid' : ''}`}
                onClick={() => handleCellClick(col, row)}
              />
            );
          })}
        </div>
      )}

      {/* Game entities */}
      {children}
    </div>
  );
}
