'use client';

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TowerDefenseConfig, DEFAULT_CONFIG } from '@/types/game';
import { generatePath } from '@/lib/pathGeneration';
import { useGameState } from '@/hooks/useGameState';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GameBoard } from './GameBoard';
import { Tower } from './Tower';
import { Enemy } from './Enemy';
import { Projectile, Explosion } from './Projectile';
import { FloatingText } from './FloatingText';
import { ResourceBar } from '@/components/UI/ResourceBar';
import { WaveIndicator } from '@/components/UI/WaveIndicator';
import { TowerMenu } from '@/components/UI/TowerMenu';
import { GameOverlay } from '@/components/UI/GameOverlay';

interface TowerDefenseGameProps {
  config?: TowerDefenseConfig;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

export function TowerDefenseGame({ config = DEFAULT_CONFIG }: TowerDefenseGameProps) {
  const [selectedTowerType, setSelectedTowerType] = useState<number | null>(null);

  // Generate path for enemies
  const path = useMemo(() => generatePath(16, 12), []);

  // Game state management
  const {
    gameState,
    startGame,
    placeTower,
    selectTower,
    moveTower,
    updateGame,
    pauseGame,
    resumeGame,
    resetGame,
    removeExplosion,
    removeFloatingText,
    getTowerTarget,
  } = useGameState(config, path);

  // Game loop
  useGameLoop({
    onUpdate: updateGame,
    paused: gameState.status !== 'playing',
  });

  // Handle tower placement
  const handlePlaceTower = useCallback(
    (x: number, y: number) => {
      if (selectedTowerType !== null) {
        const success = placeTower(x, y, selectedTowerType);
        if (success) {
          setSelectedTowerType(null);
        }
      }
    },
    [selectedTowerType, placeTower]
  );

  // Handle tower movement
  const handleMoveTower = useCallback(
    (towerId: string, x: number, y: number) => {
      moveTower(towerId, x, y);
    },
    [moveTower]
  );

  // Get headline based on game status
  const getHeadline = () => {
    switch (gameState.status) {
      case 'won':
        return config.copy.winHeadline;
      case 'lost':
        return config.copy.loseHeadline;
      default:
        return config.copy.startHeadline;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Top bar */}
      <div className="w-full max-w-[1100px] flex gap-4">
        <div className="flex-1">
          <ResourceBar
            money={gameState.money}
            lives={gameState.lives}
            score={gameState.score}
            primaryColor={config.brand.primaryColor}
            accentColor={config.brand.accentColor}
          />
        </div>
        <WaveIndicator
          currentWave={gameState.wave}
          totalWaves={config.settings.totalWaves}
          primaryColor={config.brand.primaryColor}
          accentColor={config.brand.accentColor}
          countdown={gameState.waveCountdown}
          isWaveActive={gameState.isWaveActive}
          enemyCount={gameState.enemies.length}
        />
      </div>

      {/* Main game area */}
      <div className="flex gap-4">
        {/* Game board */}
        <div className="relative">
          <GameBoard
            path={path}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            primaryColor={config.brand.primaryColor}
            secondaryColor={config.brand.secondaryColor}
            accentColor={config.brand.accentColor}
            logoUrl={config.brand.logoUrl}
            brandName={config.brand.name}
            selectedTowerType={selectedTowerType}
            selectedTowerId={gameState.selectedTower}
            onPlaceTower={handlePlaceTower}
            onMoveTower={handleMoveTower}
          >
            {/* Towers */}
            {gameState.towers.map((tower) => (
              <Tower
                key={tower.id}
                tower={tower}
                isSelected={gameState.selectedTower === tower.id}
                showRange={selectedTowerType !== null}
                onClick={() => selectTower(tower.id)}
                primaryColor={config.brand.primaryColor}
                secondaryColor={config.brand.secondaryColor}
                accentColor={config.brand.accentColor}
                gameWidth={GAME_WIDTH}
                gameHeight={GAME_HEIGHT}
                targetEnemy={getTowerTarget(tower)}
              />
            ))}

            {/* Enemies */}
            <AnimatePresence>
              {gameState.enemies.map((enemy) => (
                <Enemy
                  key={enemy.id}
                  enemy={enemy}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                />
              ))}
            </AnimatePresence>

            {/* Projectiles */}
            <AnimatePresence>
              {gameState.projectiles.map((projectile) => (
                <Projectile
                  key={projectile.id}
                  projectile={projectile}
                  accentColor={config.brand.accentColor}
                  primaryColor={config.brand.primaryColor}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                />
              ))}
            </AnimatePresence>

            {/* Explosions */}
            <AnimatePresence>
              {gameState.explosions.map((explosion) => (
                <Explosion
                  key={explosion.id}
                  x={explosion.position.x}
                  y={explosion.position.y}
                  color={explosion.color}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                  onComplete={() => removeExplosion(explosion.id)}
                />
              ))}
            </AnimatePresence>

            {/* Floating reward text */}
            <AnimatePresence>
              {gameState.floatingTexts.map((ft) => (
                <FloatingText
                  key={ft.id}
                  x={ft.position.x}
                  y={ft.position.y}
                  amount={ft.amount}
                  color={ft.color}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                  onComplete={() => removeFloatingText(ft.id)}
                />
              ))}
            </AnimatePresence>
          </GameBoard>

          {/* Game overlay (start/pause/end screens) */}
          <GameOverlay
            status={gameState.status}
            brandName={config.brand.name}
            headline={getHeadline()}
            score={gameState.score}
            wave={gameState.wave}
            onStart={startGame}
            onRestart={resetGame}
            onResume={resumeGame}
            primaryColor={config.brand.primaryColor}
            secondaryColor={config.brand.secondaryColor}
            accentColor={config.brand.accentColor}
            logoUrl={config.brand.logoUrl}
          />

          {/* Pause button */}
          {gameState.status === 'playing' && (
            <button
              onClick={pauseGame}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl glass-panel
                       flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white/70"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Tower menu */}
        <TowerMenu
          products={config.copy.gameElements}
          money={gameState.money}
          selectedTowerType={selectedTowerType}
          onSelectTower={setSelectedTowerType}
          primaryColor={config.brand.primaryColor}
          secondaryColor={config.brand.secondaryColor}
          accentColor={config.brand.accentColor}
        />
      </div>
    </div>
  );
}
