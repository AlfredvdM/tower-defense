'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  towerActionMode: 'none' | 'move';
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
  towerActionMode,
  onPlaceTower,
  onMoveTower,
  children,
}: GameBoardProps) {
  const pathData = useMemo(() => pathToSvg(path), [path]);

  // State for stars - empty initially to avoid hydration mismatch
  const [stars, setStars] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: number;
    glow: boolean;
    color: string;
  }>>([]);

  // Generate stars only on client after hydration
  useEffect(() => {
    const result: typeof stars = [];

    // Background dim stars (many small ones)
    for (let i = 0; i < 80; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 0.8 + 0.2,
        opacity: Math.random() * 0.3 + 0.1,
        glow: false,
        color: '#ffffff',
      });
    }

    // Medium stars with slight color variation
    for (let i = 80; i < 110; i++) {
      const colors = ['#ffffff', '#e0e7ff', '#fef3c7', '#dbeafe'];
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.2 + 0.6,
        opacity: Math.random() * 0.4 + 0.3,
        glow: false,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Bright glowing stars (fewer, larger, with glow effect)
    for (let i = 110; i < 125; i++) {
      const colors = ['#ffffff', '#a5b4fc', '#fcd34d', '#93c5fd'];
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 1,
        opacity: Math.random() * 0.3 + 0.6,
        glow: true,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setStars(result);
  }, []);

  // Grid for tower placement
  const gridCols = 16;
  const gridRows = 12;

  const handleCellClick = useCallback(
    (col: number, row: number) => {
      const x = ((col + 0.5) / gridCols) * 100;
      const y = ((row + 0.5) / gridRows) * 100;

      if (isOnPath({ x, y }, path, 8)) return;

      if (towerActionMode === 'move' && selectedTowerId) {
        onMoveTower(selectedTowerId, x, y);
        return;
      }

      if (selectedTowerType !== null) {
        onPlaceTower(x, y);
      }
    },
    [selectedTowerType, selectedTowerId, towerActionMode, path, onPlaceTower, onMoveTower, gridCols, gridRows]
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width,
        height,
        background: `
          radial-gradient(ellipse 90% 70% at 15% 15%, ${primaryColor}08 0%, transparent 50%),
          radial-gradient(ellipse 80% 60% at 90% 85%, ${secondaryColor}06 0%, transparent 45%),
          linear-gradient(180deg, #04040a 0%, #080810 50%, #050508 100%)
        `,
      }}
    >
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 130% 110% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)`,
        }}
      />

      {/* Very subtle grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Path SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Soft blur for ambient glow */}
          <filter id="ambientGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
          </filter>

          {/* Very soft wide blur */}
          <filter id="wideGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>

          {/* Star glow effect */}
          <filter id="starGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient along path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.5" />
          </linearGradient>

          {/* Subtle edge gradient */}
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.06" />
            <stop offset="50%" stopColor="white" stopOpacity="0.03" />
            <stop offset="100%" stopColor="white" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* High-quality starfield */}
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size * 0.15}
            fill={star.color}
            opacity={star.opacity}
            filter={star.glow ? 'url(#starGlow)' : undefined}
          />
        ))}

        {/* === ETHEREAL PATH LAYERS === */}

        {/* Layer 1: Very wide ambient glow - barely visible */}
        <path
          d={pathData}
          fill="none"
          stroke={primaryColor}
          strokeWidth="20"
          strokeLinecap="round"
          strokeOpacity="0.03"
          filter="url(#wideGlow)"
        />

        {/* Layer 2: Medium ambient aura */}
        <path
          d={pathData}
          fill="none"
          stroke={secondaryColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeOpacity="0.06"
          filter="url(#ambientGlow)"
        />

        {/* Layer 3: Soft outer edge */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#edgeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Layer 4: Main visible path - refined stroke */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Layer 5: Inner core - subtle brightness */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Spawn point - subtle pulsing ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-8 h-8 rounded-full"
        style={{
          left: `${path[0].x}%`,
          top: `${path[0].y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${primaryColor}35 0%, ${primaryColor}10 50%, transparent 70%)`,
          border: `1px solid ${primaryColor}25`,
        }}
      />

      {/* Base (goal) - refined defender point */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 15px ${accentColor}20, inset 0 0 10px ${accentColor}10`,
            `0 0 25px ${accentColor}35, inset 0 0 15px ${accentColor}20`,
            `0 0 15px ${accentColor}20, inset 0 0 10px ${accentColor}10`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-12 h-12 rounded-lg flex items-center justify-center"
        style={{
          left: `${path[path.length - 1].x}%`,
          top: `${path[path.length - 1].y}%`,
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
          border: `1px solid ${accentColor}35`,
          backdropFilter: 'blur(4px)',
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brandName}
            className="w-7 h-7 object-contain opacity-80"
          />
        ) : (
          <span className="text-lg font-medium" style={{ color: accentColor, opacity: 0.85 }}>
            {brandName.charAt(0)}
          </span>
        )}
      </motion.div>

      {/* Placement grid */}
      {(selectedTowerType !== null || towerActionMode === 'move') && (
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
