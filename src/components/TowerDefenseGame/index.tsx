'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TowerDefenseConfig, DEFAULT_CONFIG } from '@/types/game';
import { generatePath, generateMobilePath } from '@/lib/pathGeneration';
import { getUpgradeCost, generateTowerStats } from '@/lib/towerStats';
import { useGameState } from '@/hooks/useGameState';
import { useGameLoop } from '@/hooks/useGameLoop';
import { GameBoard } from './GameBoard';
import { Tower } from './Tower';
import { Enemy } from './Enemy';
import { Projectile, Explosion } from './Projectile';
import { FloatingText } from './FloatingText';
import { TowerMenu } from '@/components/UI/TowerMenu';
import { GameOverlay } from '@/components/UI/GameOverlay';
import { TutorialOverlay } from '@/components/UI/TutorialOverlay';
import { TowerActionPopup } from './TowerActionPopup';

interface TowerDefenseGameProps {
  config?: TowerDefenseConfig;
}

const SIDE_PANEL_WIDTH = 280;

const TUTORIAL_STORAGE_KEY = 'tower-defense-tutorial-seen';

export function TowerDefenseGame({ config = DEFAULT_CONFIG }: TowerDefenseGameProps) {
  const [selectedTowerType, setSelectedTowerType] = useState<number | null>(null);
  const [towerActionMode, setTowerActionMode] = useState<'none' | 'move'>('none');
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 3 | null>(null);

  // Responsive dimensions
  const [isMobile, setIsMobile] = useState(false);
  const [gameDimensions, setGameDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const mobile = screenWidth < 768;
      const portrait = screenHeight > screenWidth;

      setIsMobile(mobile);

      if (mobile) {
        // Mobile: Fill entire screen, tower bar overlays bottom
        const padding = 0;
        const width = screenWidth - (padding * 2);
        const height = screenHeight - (padding * 2);
        setGameDimensions({ width, height });
      } else {
        // Desktop: Side panel layout with minimal padding
        const availableWidth = screenWidth - SIDE_PANEL_WIDTH - 24; // panel + smaller gaps
        const availableHeight = screenHeight - 32; // minimal top/bottom padding
        const targetAspect = 16 / 10;

        let width: number, height: number;
        if (availableWidth / availableHeight > targetAspect) {
          height = availableHeight;
          width = height * targetAspect;
        } else {
          width = availableWidth;
          height = width / targetAspect;
        }
        setGameDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);


  // Debug: Press Ctrl+Shift+T to reset tutorial
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        localStorage.removeItem(TUTORIAL_STORAGE_KEY);
        setTutorialStep(null);
        console.log('Tutorial reset - click Start Game to see it');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const GAME_WIDTH = gameDimensions.width;
  const GAME_HEIGHT = gameDimensions.height;

  // Generate path for enemies (different path for mobile)
  const path = useMemo(() => isMobile ? generateMobilePath() : generatePath(16, 12), [isMobile]);

  // Game state management
  const {
    gameState,
    startGame,
    placeTower,
    selectTower,
    upgradeTower,
    moveTower,
    updateGame,
    pauseGame,
    resumeGame,
    resetGame,
    removeExplosion,
    removeFloatingText,
    getTowerTarget,
  } = useGameState(config, path);

  // Handle start game - start game first, then show tutorial if not seen
  const handleStartGame = useCallback(() => {
    startGame();
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeenTutorial) {
      setTutorialStep(1);
    }
  }, [startGame]);

  // Tutorial handlers
  const handleTutorialNext = useCallback(() => {
    setTutorialStep((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : prev));
  }, []);

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setTutorialStep(null);
  }, []);

  const handleTutorialSkip = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setTutorialStep(null);
  }, []);

  // Get selected tower data
  const selectedTower = gameState.towers.find(t => t.id === gameState.selectedTower);

  // Game loop - pause during tutorial
  useGameLoop({
    onUpdate: updateGame,
    paused: gameState.status !== 'playing' || tutorialStep !== null,
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
      setTowerActionMode('none');
    },
    [moveTower]
  );

  // Handle upgrade from popup
  const handleUpgrade = useCallback(() => {
    if (selectedTower) {
      upgradeTower(selectedTower.id);
    }
  }, [selectedTower, upgradeTower]);

  // Handle move mode from popup
  const handleStartMove = useCallback(() => {
    setTowerActionMode('move');
  }, []);

  // Handle cancel/deselect
  const handleCancelAction = useCallback(() => {
    selectTower(null);
    setTowerActionMode('none');
  }, [selectTower]);

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

  // Get selected tower info for mobile
  const selectedTowerInfo = selectedTowerType !== null
    ? generateTowerStats(config.copy.gameElements[selectedTowerType], selectedTowerType, config.brand.accentColor)
    : null;

  // ============ DESKTOP LAYOUT ============
  if (!isMobile) {
    return (
      <div className="w-full h-screen flex items-stretch gap-4 p-4 game-container">
        {/* Command Panel - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="command-panel flex flex-col"
          style={{ width: SIDE_PANEL_WIDTH }}
        >
          {/* Status Section */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm uppercase tracking-widest text-white/40 font-medium">Status</h2>
              {gameState.status === 'playing' && (
                <button
                  onClick={pauseGame}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
              {/* Money */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                       style={{ backgroundColor: `${config.brand.accentColor}20`, color: config.brand.accentColor }}>
                    $
                  </div>
                  <span className="text-white/50 text-base">Credits</span>
                </div>
                <motion.span
                  key={gameState.money}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: config.brand.accentColor }}
                >
                  {gameState.money.toLocaleString()}
                </motion.span>
              </div>

              {/* Lives */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/20">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <span className="text-white/50 text-base">Lives</span>
                </div>
                <motion.span
                  key={gameState.lives}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: gameState.lives <= 5 ? '#ef4444' : '#fff' }}
                >
                  {gameState.lives}
                </motion.span>
              </div>

              {/* Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: `${config.brand.primaryColor}20`, color: config.brand.primaryColor }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <span className="text-white/50 text-base">Score</span>
                </div>
                <span className="text-2xl font-bold tabular-nums" style={{ color: config.brand.primaryColor }}>
                  {gameState.score.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Wave Section */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm uppercase tracking-widest text-white/40 font-medium mb-3">Wave Progress</h2>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-4xl font-bold" style={{ color: config.brand.primaryColor }}>
                {gameState.wave}
              </span>
              <span className="text-white/40 text-lg">/ {config.settings.totalWaves}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.wave / config.settings.totalWaves) * 100}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: config.brand.primaryColor }}
              />
            </div>

            {/* Status */}
            <AnimatePresence mode="wait">
              {gameState.waveCountdown > 0 ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-white/50 text-base">Next wave in</span>
                  <motion.span
                    key={gameState.waveCountdown}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-bold"
                    style={{ color: config.brand.accentColor }}
                  >
                    {gameState.waveCountdown}s
                  </motion.span>
                </motion.div>
              ) : gameState.isWaveActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-red-500"
                  />
                  <span className="text-white/50 text-base">
                    {gameState.enemies.length} enemies remaining
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-green-400 text-base"
                >
                  Ready
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tower Selection */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 pb-2">
              <h2 className="text-sm uppercase tracking-widest text-white/40 font-medium">Deploy</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
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
        </motion.div>

        {/* Game Canvas - Right Side */}
        <div className="flex-1 flex items-center justify-center relative" onClick={handleCancelAction}>
          <div
            className="game-canvas-container rounded-2xl overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
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
              towerActionMode={towerActionMode}
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
              onStart={handleStartGame}
              onRestart={resetGame}
              onResume={resumeGame}
              primaryColor={config.brand.primaryColor}
              secondaryColor={config.brand.secondaryColor}
              accentColor={config.brand.accentColor}
              logoUrl={config.brand.logoUrl}
            />

            {/* Tutorial overlay */}
            {tutorialStep !== null && (
              <TutorialOverlay
                step={tutorialStep}
                onNext={handleTutorialNext}
                onSkip={handleTutorialSkip}
                onStart={handleTutorialComplete}
                primaryColor={config.brand.primaryColor}
                secondaryColor={config.brand.secondaryColor}
                accentColor={config.brand.accentColor}
                isMobile={isMobile}
              />
            )}

            {/* Wave 1 Countdown Overlay - 3, 2, 1 */}
            <AnimatePresence>
              {gameState.wave === 1 && gameState.waveCountdown > 0 && gameState.waveCountdown <= 3 && gameState.status === 'playing' && tutorialStep === null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none"
                >
                  <motion.span
                    key={gameState.waveCountdown}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-9xl font-black"
                    style={{
                      color: config.brand.accentColor,
                      textShadow: `0 0 40px ${config.brand.accentColor}, 0 0 80px ${config.brand.accentColor}60`,
                    }}
                  >
                    {gameState.waveCountdown}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tower action popup */}
            <AnimatePresence>
              {selectedTower && gameState.status === 'playing' && towerActionMode === 'none' && (
                <TowerActionPopup
                  tower={selectedTower}
                  money={gameState.money}
                  onUpgrade={handleUpgrade}
                  onMove={handleStartMove}
                  onCancel={handleCancelAction}
                  primaryColor={config.brand.primaryColor}
                  secondaryColor={config.brand.secondaryColor}
                  accentColor={config.brand.accentColor}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                  isMobile={isMobile}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ============ MOBILE LAYOUT ============
  return (
    <div className="w-full h-full relative game-container overflow-hidden">
      {/* Full Screen Game Area */}
      <div className="absolute inset-0" onClick={handleCancelAction}>
        <div className="relative w-full h-full">
          {/* Floating HUD */}
          {gameState.status === 'playing' && (
            <div className="absolute top-2 left-2 right-2 z-[100] flex items-center justify-between pointer-events-none">
              {/* Stats */}
              <div className="pointer-events-auto flex items-center gap-2">
                <div className="mobile-stat-pill" style={{ borderColor: `${config.brand.accentColor}40` }}>
                  <span style={{ color: config.brand.accentColor }}>${gameState.money}</span>
                </div>
                <div className="mobile-stat-pill" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
                  <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-white">{gameState.lives}</span>
                </div>
                <div className="mobile-stat-pill" style={{ borderColor: `${config.brand.primaryColor}40` }}>
                  <span style={{ color: config.brand.primaryColor }}>W{gameState.wave}</span>
                </div>
              </div>

              {/* Pause */}
              <button
                onClick={pauseGame}
                className="pointer-events-auto w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
            </div>
          )}

          {/* Game Board - Full Screen */}
          <div className="w-full h-full overflow-hidden">
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
              towerActionMode={towerActionMode}
              onPlaceTower={handlePlaceTower}
              onMoveTower={handleMoveTower}
            >
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
                  isMobile={true}
                />
              ))}

              <AnimatePresence>
                {gameState.enemies.map((enemy) => (
                  <Enemy key={enemy.id} enemy={enemy} gameWidth={GAME_WIDTH} gameHeight={GAME_HEIGHT} />
                ))}
              </AnimatePresence>

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

            <GameOverlay
              status={gameState.status}
              brandName={config.brand.name}
              headline={getHeadline()}
              score={gameState.score}
              wave={gameState.wave}
              onStart={handleStartGame}
              onRestart={resetGame}
              onResume={resumeGame}
              primaryColor={config.brand.primaryColor}
              secondaryColor={config.brand.secondaryColor}
              accentColor={config.brand.accentColor}
              logoUrl={config.brand.logoUrl}
            />

            {/* Tutorial overlay */}
            {tutorialStep !== null && (
              <TutorialOverlay
                step={tutorialStep}
                onNext={handleTutorialNext}
                onSkip={handleTutorialSkip}
                onStart={handleTutorialComplete}
                primaryColor={config.brand.primaryColor}
                secondaryColor={config.brand.secondaryColor}
                accentColor={config.brand.accentColor}
                isMobile={isMobile}
              />
            )}

            {/* Wave 1 Countdown Overlay - 3, 2, 1 */}
            <AnimatePresence>
              {gameState.wave === 1 && gameState.waveCountdown > 0 && gameState.waveCountdown <= 3 && gameState.status === 'playing' && tutorialStep === null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none"
                >
                  <motion.span
                    key={gameState.waveCountdown}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-8xl font-black"
                    style={{
                      color: config.brand.accentColor,
                      textShadow: `0 0 40px ${config.brand.accentColor}, 0 0 80px ${config.brand.accentColor}60`,
                    }}
                  >
                    {gameState.waveCountdown}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedTower && gameState.status === 'playing' && towerActionMode === 'none' && (
                <TowerActionPopup
                  tower={selectedTower}
                  money={gameState.money}
                  onUpgrade={handleUpgrade}
                  onMove={handleStartMove}
                  onCancel={handleCancelAction}
                  primaryColor={config.brand.primaryColor}
                  secondaryColor={config.brand.secondaryColor}
                  accentColor={config.brand.accentColor}
                  gameWidth={GAME_WIDTH}
                  gameHeight={GAME_HEIGHT}
                  isMobile={isMobile}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Tower Selector - Overlays bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[100] mobile-tower-bar safe-area-bottom">
        {/* Selected tower info */}
        <AnimatePresence>
          {selectedTowerInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-4 py-1.5 border-b border-white/10 flex items-center justify-center gap-3"
            >
              <span className="text-white font-medium text-sm">{selectedTowerInfo.name}</span>
              <span className="text-sm" style={{ color: config.brand.accentColor }}>${selectedTowerInfo.cost}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tower buttons - responsive grid */}
        <div
          className="grid gap-2 p-2 w-full"
          style={{
            gridTemplateColumns: `repeat(${config.copy.gameElements.length}, 1fr)`,
          }}
        >
          {config.copy.gameElements.map((productName, index) => {
            const tower = generateTowerStats(productName, index, config.brand.accentColor);
            const isSelected = selectedTowerType === index;
            const canAfford = gameState.money >= tower.cost;

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTowerType(isSelected ? null : index)}
                disabled={!canAfford && !isSelected}
                className={`mobile-tower-button-responsive ${isSelected ? 'selected' : ''} ${!canAfford && !isSelected ? 'disabled' : ''}`}
                style={{
                  '--tower-color': config.brand.primaryColor,
                  '--tower-accent': config.brand.accentColor,
                } as React.CSSProperties}
              >
                <div className="tower-icon-responsive">
                  {tower.name.charAt(0)}
                </div>
                <span className="tower-name-responsive">{tower.name}</span>
                <span className="tower-cost-responsive">${tower.cost}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
