'use client';

import { useState, useCallback, useRef } from 'react';
import {
  GameState,
  Tower,
  Enemy,
  Projectile,
  ExplosionEffect,
  FloatingText,
  TowerDefenseConfig,
  PathPoint,
} from '@/types/game';
import { generateTowerStats, getUpgradeCost, getUpgradedStats } from '@/lib/towerStats';
import { createEnemy, updateEnemyPosition, getWaveConfig, isInRange } from '@/lib/enemyAI';
import { isOnPath } from '@/lib/pathGeneration';

const INITIAL_LIVES = 20;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const WAVE_COUNTDOWN_MS = 3000; // 3 second countdown between waves
const FIRST_WAVE_COUNTDOWN_MS = 15000; // 15 seconds for first wave to familiarize

export interface ExtendedGameState extends GameState {
  waveCountdown: number; // Seconds until next wave starts
  isWaveActive: boolean; // Are enemies currently spawning/alive?
  enemiesSpawnedThisWave: number; // Track spawned enemies in state
  totalEnemiesThisWave: number; // Total enemies for current wave
}

export function useGameState(config: TowerDefenseConfig, path: PathPoint[]) {
  const [gameState, setGameState] = useState<ExtendedGameState>({
    status: 'idle',
    money: config.settings.startingMoney,
    lives: INITIAL_LIVES,
    wave: 0,
    score: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    explosions: [],
    floatingTexts: [],
    selectedTower: null,
    waveCountdown: 0,
    isWaveActive: false,
    enemiesSpawnedThisWave: 0,
    totalEnemiesThisWave: 0,
  });

  const enemyIdCounter = useRef(0);
  const projectileIdCounter = useRef(0);
  const towerIdCounter = useRef(0);
  const explosionIdCounter = useRef(0);
  const floatingTextIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);
  const waveStartTime = useRef(0);

  const startGame = useCallback(() => {
    const now = performance.now();
    enemyIdCounter.current = 0;
    projectileIdCounter.current = 0;
    explosionIdCounter.current = 0;
    floatingTextIdCounter.current = 0;
    lastSpawnTime.current = 0;
    waveStartTime.current = now + FIRST_WAVE_COUNTDOWN_MS;

    const waveOneConfig = getWaveConfig(1, config.settings.difficulty);

    setGameState({
      status: 'playing',
      money: config.settings.startingMoney,
      lives: INITIAL_LIVES,
      wave: 1,
      score: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      explosions: [],
      floatingTexts: [],
      selectedTower: null,
      waveCountdown: Math.ceil(FIRST_WAVE_COUNTDOWN_MS / 1000),
      isWaveActive: false,
      enemiesSpawnedThisWave: 0,
      totalEnemiesThisWave: waveOneConfig.enemyCount,
    });
  }, [config]);

  const placeTower = useCallback((x: number, y: number, towerTypeIndex: number) => {
    const towerType = generateTowerStats(
      config.copy.gameElements[towerTypeIndex] || 'Tower',
      towerTypeIndex,
      config.brand.accentColor
    );

    // Check if position is on path
    if (isOnPath({ x, y }, path, 8)) {
      return false;
    }

    setGameState((prev) => {
      if (prev.money < towerType.cost) return prev;

      // Check if position is already occupied
      const isOccupied = prev.towers.some(
        (t) => Math.abs(t.position.x - x) < 8 && Math.abs(t.position.y - y) < 8
      );
      if (isOccupied) return prev;

      const newTower: Tower = {
        id: `tower-${towerIdCounter.current++}`,
        name: towerType.name,
        position: { x, y },
        range: towerType.range,
        damage: towerType.damage,
        fireRate: towerType.fireRate,
        cost: towerType.cost,
        lastFired: 0,
        level: 1,
        color: towerType.color,
      };

      return {
        ...prev,
        money: prev.money - towerType.cost,
        towers: [...prev.towers, newTower],
      };
    });

    return true;
  }, [config, path]);

  const selectTower = useCallback((towerId: string | null) => {
    setGameState((prev) => ({ ...prev, selectedTower: towerId }));
  }, []);

  const upgradeTower = useCallback((towerId: string) => {
    setGameState((prev) => {
      const tower = prev.towers.find(t => t.id === towerId);
      if (!tower) return prev;

      const upgradeCost = getUpgradeCost(tower.cost, tower.level);
      if (prev.money < upgradeCost) return prev;

      // Get tower type index from name to get proper upgraded stats
      const towerTypeIndex = config.copy.gameElements.indexOf(tower.name);
      const baseTowerType = generateTowerStats(
        tower.name,
        towerTypeIndex >= 0 ? towerTypeIndex : 0,
        tower.color
      );
      const upgradedStats = getUpgradedStats(baseTowerType, tower.level + 1);

      return {
        ...prev,
        money: prev.money - upgradeCost,
        towers: prev.towers.map(t =>
          t.id === towerId
            ? {
                ...t,
                level: t.level + 1,
                damage: upgradedStats.damage,
                range: upgradedStats.range,
                fireRate: upgradedStats.fireRate,
              }
            : t
        ),
      };
    });
  }, [config]);

  const moveTower = useCallback((towerId: string, x: number, y: number) => {
    // Check if position is on path
    if (isOnPath({ x, y }, path, 8)) {
      return false;
    }

    setGameState((prev) => {
      // Check if position is already occupied by another tower
      const isOccupied = prev.towers.some(
        (t) => t.id !== towerId && Math.abs(t.position.x - x) < 8 && Math.abs(t.position.y - y) < 8
      );
      if (isOccupied) return prev;

      return {
        ...prev,
        towers: prev.towers.map((t) =>
          t.id === towerId ? { ...t, position: { x, y } } : t
        ),
        selectedTower: null, // Deselect after moving
      };
    });

    return true;
  }, [path]);

  const removeExplosion = useCallback((explosionId: string) => {
    setGameState((prev) => ({
      ...prev,
      explosions: prev.explosions.filter((e) => e.id !== explosionId),
    }));
  }, []);

  const removeFloatingText = useCallback((floatingTextId: string) => {
    setGameState((prev) => ({
      ...prev,
      floatingTexts: prev.floatingTexts.filter((ft) => ft.id !== floatingTextId),
    }));
  }, []);

  const updateGame = useCallback((deltaTime: number) => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      console.log('[WAVE STATE]', {
        wave: prev.wave,
        isWaveActive: prev.isWaveActive,
        spawned: prev.enemiesSpawnedThisWave,
        total: prev.totalEnemiesThisWave,
        enemiesAlive: prev.enemies.length,
        countdown: prev.waveCountdown
      });

      // Get current wave config from state values (not refs!)
      const currentWaveConfig = getWaveConfig(prev.wave, config.settings.difficulty);

      let newEnemies = [...prev.enemies];
      let newProjectiles = [...prev.projectiles];
      let newExplosions = [...prev.explosions];
      let newFloatingTexts = [...prev.floatingTexts];
      let newLives = prev.lives;
      let newMoney = prev.money;
      let newScore = prev.score;
      let newWave = prev.wave;
      let newStatus: GameState['status'] = prev.status;
      let newWaveCountdown = prev.waveCountdown;
      let newIsWaveActive = prev.isWaveActive;
      let newEnemiesSpawnedThisWave = prev.enemiesSpawnedThisWave;
      let newTotalEnemiesThisWave = prev.totalEnemiesThisWave;
      const newTowers = prev.towers.map((t) => ({ ...t }));
      const currentTime = performance.now();

      // Handle wave countdown
      if (!newIsWaveActive && newWaveCountdown > 0) {
        const timeUntilWave = waveStartTime.current - currentTime;
        newWaveCountdown = Math.max(0, Math.ceil(timeUntilWave / 1000));

        if (timeUntilWave <= 0) {
          newIsWaveActive = true;
          newWaveCountdown = 0;
          const waveConfig = getWaveConfig(prev.wave, config.settings.difficulty);
          newTotalEnemiesThisWave = waveConfig.enemyCount;
          lastSpawnTime.current = currentTime - waveConfig.spawnDelay - 100;
          newEnemiesSpawnedThisWave = 0;
        }
      }

      // Spawn enemies in batches when wave is active
      if (newIsWaveActive && newEnemiesSpawnedThisWave < newTotalEnemiesThisWave) {
        const timeSinceLastSpawn = currentTime - lastSpawnTime.current;

        if (timeSinceLastSpawn >= currentWaveConfig.spawnDelay) {
          // Calculate how many enemies to spawn in this batch
          const remaining = newTotalEnemiesThisWave - newEnemiesSpawnedThisWave;
          const toSpawn = Math.min(currentWaveConfig.batchSize, remaining);

          for (let i = 0; i < toSpawn; i++) {
            const newEnemy = createEnemy(
              `enemy-${enemyIdCounter.current++}`,
              prev.wave,
              newEnemiesSpawnedThisWave + i,
              config.settings.difficulty,
              path
            );
            newEnemies.push(newEnemy);
          }
          newEnemiesSpawnedThisWave += toSpawn;
          lastSpawnTime.current = currentTime;
          console.log('[ENEMY BATCH SPAWNED]', toSpawn, 'enemies,', newEnemiesSpawnedThisWave, 'of', newTotalEnemiesThisWave);
        }
      }

      // Update enemy positions
      const enemiesToRemove: string[] = [];
      newEnemies = newEnemies.map((enemy) => {
        const { enemy: updatedEnemy, reachedEnd } = updateEnemyPosition(
          enemy,
          path,
          deltaTime
        );

        if (reachedEnd) {
          enemiesToRemove.push(enemy.id);
          newLives--;
        }

        return updatedEnemy;
      });

      // Remove enemies that reached the end
      newEnemies = newEnemies.filter((e) => !enemiesToRemove.includes(e.id));

      // Tower attacks - find targets and create projectiles with velocity
      newTowers.forEach((tower) => {
        if (currentTime - tower.lastFired < tower.fireRate) return;

        // Find closest enemy in range
        let closestEnemy: Enemy | null = null;
        let closestDistance = Infinity;

        newEnemies.forEach((enemy) => {
          if (isInRange(enemy.position, tower.position, tower.range, GAME_WIDTH, GAME_HEIGHT)) {
            const dx = enemy.position.x - tower.position.x;
            const dy = enemy.position.y - tower.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestEnemy = enemy;
            }
          }
        });

        if (closestEnemy !== null) {
          tower.lastFired = currentTime;
          const targetEnemy: Enemy = closestEnemy;

          // Calculate initial velocity towards target
          const dx = targetEnemy.position.x - tower.position.x;
          const dy = targetEnemy.position.y - tower.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 4;

          // Upgraded towers (level 2+) use continuous beam attack
          // Beam is rendered from Tower component, damage applied here on fire rate
          if (tower.level >= 2) {
            // Beam does instant damage
            targetEnemy.health -= tower.damage;

            // Small impact effect at target (beam visual is rendered from Tower)
            newExplosions.push({
              id: `exp-${explosionIdCounter.current++}`,
              position: { ...targetEnemy.position },
              color: tower.color,
            });

            // Check if enemy died from beam
            if (targetEnemy.health <= 0) {
              enemiesToRemove.push(targetEnemy.id);
              newMoney += targetEnemy.reward;
              newScore += targetEnemy.reward * 10;

              // Bigger explosion for kill
              newExplosions.push({
                id: `exp-${explosionIdCounter.current++}`,
                position: { ...targetEnemy.position },
                color: '#ef4444',
              });

              // Floating text showing reward
              newFloatingTexts.push({
                id: `ft-${floatingTextIdCounter.current++}`,
                position: { ...targetEnemy.position },
                amount: targetEnemy.reward,
                color: config.brand.accentColor,
              });
            }
          } else {
            // Normal projectile for non-max level towers
            newProjectiles.push({
              id: `proj-${projectileIdCounter.current++}`,
              position: { ...tower.position },
              targetId: targetEnemy.id,
              damage: tower.damage,
              speed,
              velocityX: (dx / distance) * speed,
              velocityY: (dy / distance) * speed,
              color: tower.color,
            });
          }
        }
      });

      // Update projectiles with homing behavior
      const projectilesToRemove: string[] = [];
      newProjectiles = newProjectiles.map((proj) => {
        const target = newEnemies.find((e) => e.id === proj.targetId);

        // If target is dead, continue in current direction
        if (!target) {
          if (proj.position.x < -5 || proj.position.x > 105 ||
              proj.position.y < -5 || proj.position.y > 105) {
            projectilesToRemove.push(proj.id);
          }
          return {
            ...proj,
            position: {
              x: proj.position.x + (proj.velocityX || 0),
              y: proj.position.y + (proj.velocityY || 0),
            },
          };
        }

        const dx = target.position.x - proj.position.x;
        const dy = target.position.y - proj.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Hit detection
        if (distance < 2.5) {
          target.health -= proj.damage;
          projectilesToRemove.push(proj.id);

          // Create explosion effect
          newExplosions.push({
            id: `exp-${explosionIdCounter.current++}`,
            position: { ...proj.position },
            color: config.brand.accentColor,
          });

          if (target.health <= 0) {
            enemiesToRemove.push(target.id);
            newMoney += target.reward;
            newScore += target.reward * 10;

            // Bigger explosion for kill
            newExplosions.push({
              id: `exp-${explosionIdCounter.current++}`,
              position: { ...target.position },
              color: '#ef4444',
            });

            // Floating text showing reward
            newFloatingTexts.push({
              id: `ft-${floatingTextIdCounter.current++}`,
              position: { ...target.position },
              amount: target.reward,
              color: config.brand.accentColor,
            });
          }

          return proj;
        }

        // Update velocity to home towards target
        const speed = proj.speed;
        const newVelX = (dx / distance) * speed;
        const newVelY = (dy / distance) * speed;

        return {
          ...proj,
          position: {
            x: proj.position.x + newVelX,
            y: proj.position.y + newVelY,
          },
          velocityX: newVelX,
          velocityY: newVelY,
        };
      });

      // Remove dead enemies and used projectiles
      newEnemies = newEnemies.filter(
        (e) => !enemiesToRemove.includes(e.id) && e.health > 0
      );
      newProjectiles = newProjectiles.filter(
        (p) => !projectilesToRemove.includes(p.id)
      );

      // Check wave completion - use state values, not refs!
      if (
        newIsWaveActive &&
        newEnemiesSpawnedThisWave >= newTotalEnemiesThisWave &&
        newEnemies.length === 0
      ) {
        if (prev.wave >= config.settings.totalWaves) {
          newStatus = 'won';
        } else {
          // Start countdown for next wave
          newWave = prev.wave + 1;
          newIsWaveActive = false;
          newWaveCountdown = Math.ceil(WAVE_COUNTDOWN_MS / 1000);
          waveStartTime.current = currentTime + WAVE_COUNTDOWN_MS;
          newEnemiesSpawnedThisWave = 0;
          // Reset lastSpawnTime so first enemy of next wave spawns immediately
          lastSpawnTime.current = 0;
          // Calculate total enemies for the next wave
          const nextWaveConfig = getWaveConfig(newWave, config.settings.difficulty);
          newTotalEnemiesThisWave = nextWaveConfig.enemyCount;
          console.log('[WAVE COMPLETE]', prev.wave, '-> starting wave', newWave);
        }
      }

      // Safety check: if wave is active but no enemies and not all spawned, force a spawn
      if (
        newIsWaveActive &&
        newEnemies.length === 0 &&
        newEnemiesSpawnedThisWave < newTotalEnemiesThisWave &&
        newTotalEnemiesThisWave > 0
      ) {
        // Force spawn the next enemy immediately
        const newEnemy = createEnemy(
          `enemy-${enemyIdCounter.current++}`,
          prev.wave,
          newEnemiesSpawnedThisWave,
          config.settings.difficulty,
          path
        );
        newEnemies.push(newEnemy);
        newEnemiesSpawnedThisWave++;
        lastSpawnTime.current = currentTime;
        console.log('[SAFETY SPAWN]', newEnemiesSpawnedThisWave, 'of', newTotalEnemiesThisWave);
      }

      // Check game over
      if (newLives <= 0) {
        newStatus = 'lost';
      }

      return {
        ...prev,
        status: newStatus,
        money: newMoney,
        lives: newLives,
        wave: newWave,
        score: newScore,
        towers: newTowers,
        enemies: newEnemies,
        projectiles: newProjectiles,
        explosions: newExplosions,
        floatingTexts: newFloatingTexts,
        waveCountdown: newWaveCountdown,
        isWaveActive: newIsWaveActive,
        enemiesSpawnedThisWave: newEnemiesSpawnedThisWave,
        totalEnemiesThisWave: newTotalEnemiesThisWave,
      };
    });
  }, [config, path]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : prev.status,
    }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      status: prev.status === 'paused' ? 'playing' : prev.status,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      status: 'idle',
      money: config.settings.startingMoney,
      lives: INITIAL_LIVES,
      wave: 0,
      score: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      explosions: [],
      floatingTexts: [],
      selectedTower: null,
      waveCountdown: 0,
      isWaveActive: false,
      enemiesSpawnedThisWave: 0,
      totalEnemiesThisWave: 0,
    });
  }, [config]);

  // Find target enemy for each tower (for turret rotation)
  const getTowerTarget = useCallback((tower: Tower): Enemy | null => {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    gameState.enemies.forEach((enemy) => {
      if (isInRange(enemy.position, tower.position, tower.range, GAME_WIDTH, GAME_HEIGHT)) {
        const dx = enemy.position.x - tower.position.x;
        const dy = enemy.position.y - tower.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      }
    });

    return closestEnemy;
  }, [gameState.enemies]);

  return {
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
  };
}
