import { Enemy, PathPoint } from '@/types/game';
import { getPositionOnPath } from './pathGeneration';

export interface WaveConfig {
  enemyCount: number;
  enemyHealth: number;
  enemySpeed: number;
  enemyReward: number;
  spawnDelay: number;
}

// Get wave configuration based on wave number and difficulty
// Wave 1: 1 enemy, Wave 2: 3 enemies, Wave 3: 6 enemies, etc.
export function getWaveConfig(
  wave: number,
  difficulty: 'easy' | 'medium' | 'hard'
): WaveConfig {
  const difficultyMultiplier = {
    easy: 0.7,
    medium: 1,
    hard: 1.5,
  }[difficulty];

  // Progressive enemy count: 1, 3, 6, 10, 15, 21... (triangular numbers)
  // Formula: n*(n+1)/2 where n is wave number
  const baseEnemyCount = Math.floor((wave * (wave + 1)) / 2);
  const enemyCount = Math.max(1, Math.floor(baseEnemyCount * difficultyMultiplier));

  // Health scales with wave but not too quickly
  const baseHealth = 40 + wave * 15;

  // Speed increases gradually
  const baseSpeed = 0.12 + wave * 0.015;

  // Spawn delay decreases as waves progress (more frequent spawns)
  // Starts at 1200ms, decreases to minimum 300ms
  const spawnDelay = Math.max(300, 1200 - wave * 80);

  return {
    enemyCount,
    enemyHealth: Math.floor(baseHealth * difficultyMultiplier),
    enemySpeed: baseSpeed * difficultyMultiplier,
    enemyReward: Math.floor(15 + wave * 8),
    spawnDelay,
  };
}

// Create a new enemy for a wave with variety
export function createEnemy(
  id: string,
  wave: number,
  enemyIndex: number,
  difficulty: 'easy' | 'medium' | 'hard',
  path: PathPoint[]
): Enemy {
  const config = getWaveConfig(wave, difficulty);
  const startPos = getPositionOnPath(path, 0);

  // Get enemy type for variety
  const enemyType = getEnemyType(wave, enemyIndex);

  return {
    id,
    position: { ...startPos },
    health: Math.floor(config.enemyHealth * enemyType.healthMultiplier),
    maxHealth: Math.floor(config.enemyHealth * enemyType.healthMultiplier),
    speed: config.enemySpeed * enemyType.speed,
    pathIndex: 0,
    reward: Math.floor(config.enemyReward * enemyType.healthMultiplier),
  };
}

// Update enemy position along path
export function updateEnemyPosition(
  enemy: Enemy,
  path: PathPoint[],
  deltaTime: number
): { enemy: Enemy; reachedEnd: boolean } {
  const pathProgress = enemy.pathIndex / 100;
  const newProgress = Math.min(1, pathProgress + enemy.speed * (deltaTime / 1000));
  const newPos = getPositionOnPath(path, newProgress);

  return {
    enemy: {
      ...enemy,
      position: newPos,
      pathIndex: newProgress * 100,
    },
    reachedEnd: newProgress >= 1,
  };
}

// Check if enemy is in tower range
export function isInRange(
  enemyPos: { x: number; y: number },
  towerPos: { x: number; y: number },
  range: number,
  gameWidth: number,
  gameHeight: number
): boolean {
  // Convert percentage positions to actual pixel distance
  const dx = (enemyPos.x - towerPos.x) * gameWidth / 100;
  const dy = (enemyPos.y - towerPos.y) * gameHeight / 100;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= range;
}

// Get enemy types for visual variety
export function getEnemyType(wave: number, index: number): {
  size: number;
  speed: number;
  healthMultiplier: number;
  name: string;
  color: string;
} {
  const types = [
    { size: 1, speed: 1, healthMultiplier: 1, name: 'Scout', color: '#ef4444' },
    { size: 1.15, speed: 0.85, healthMultiplier: 1.4, name: 'Soldier', color: '#f97316' },
    { size: 0.85, speed: 1.3, healthMultiplier: 0.75, name: 'Runner', color: '#eab308' },
    { size: 1.3, speed: 0.7, healthMultiplier: 2, name: 'Heavy', color: '#dc2626' },
    { size: 1.6, speed: 0.5, healthMultiplier: 4, name: 'Boss', color: '#7c2d12' },
  ];

  // Every 5th wave starts with a boss
  if (wave % 5 === 0 && index === 0) {
    return types[4]; // Boss
  }

  // Wave 3+ introduces Heavies
  if (wave >= 3 && index % 5 === 0) {
    return types[3]; // Heavy
  }

  // Mix of regular types based on index
  return types[index % 3];
}

// Get visual properties for enemy based on health ratio
export function getEnemyVisuals(enemy: Enemy, wave: number, index: number) {
  const type = getEnemyType(wave, index);
  const healthRatio = enemy.health / enemy.maxHealth;

  return {
    size: type.size * (enemy.maxHealth > 100 ? 1.2 : 1),
    color: type.color,
    glowIntensity: healthRatio,
    isDamaged: healthRatio < 0.5,
    isCritical: healthRatio < 0.25,
  };
}
