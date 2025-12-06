import { Enemy, PathPoint } from '@/types/game';
import { getPositionOnPath } from './pathGeneration';

export interface WaveConfig {
  enemyCount: number;
  enemyHealth: number;
  enemySpeed: number;
  enemyReward: number;
  spawnDelay: number;
  batchSize: number;
}

// Get wave configuration based on wave number and difficulty
// Wave 1: 1 enemy, Wave 2: 3 enemies, Wave 3: 6 enemies, etc.
export function getWaveConfig(
  wave: number,
  difficulty: 'easy' | 'medium' | 'hard'
): WaveConfig {
  const safeWave = Math.max(1, wave || 1);

  const difficultyMultiplier = {
    easy: 0.7,
    medium: 1,
    hard: 1.5,
  }[difficulty] ?? 1;

  // Wave-specific enemy counts for later waves
  const waveEnemyCounts: Record<number, number> = {
    7: 10,
    8: 12,
    9: 15,
    10: 20,
  };

  // Use specific count for waves 7-10, otherwise linear progression
  const baseEnemyCount = waveEnemyCounts[safeWave] ?? safeWave;
  const enemyCount = Math.max(1, Math.floor(baseEnemyCount * difficultyMultiplier)) || 1;

  // Health scales with wave - gets significantly harder in later waves
  // Wave 1: 50, Wave 5: 130, Wave 10: 280
  const baseHealth = 30 + safeWave * 20 + Math.floor(safeWave * safeWave * 0.5);

  // Speed increases gradually - enemies get faster each wave
  // Wave 1: 0.14, Wave 5: 0.22, Wave 10: 0.32
  const baseSpeed = 0.12 + safeWave * 0.02;

  // Spawn delay decreases as waves progress (more frequent spawns)
  // Starts at 800ms, decreases to minimum 200ms
  const spawnDelay = Math.max(200, 800 - safeWave * 50);

  // Batch size increases with wave (more enemies spawn at once)
  // Wave 1-2: 1, Wave 3-5: 2, Wave 6-8: 3, Wave 9+: 4
  const batchSize = Math.min(4, 1 + Math.floor(safeWave / 3));

  const enemyHealth = Math.floor(baseHealth * difficultyMultiplier) || 55;
  const enemySpeed = baseSpeed * difficultyMultiplier || 0.12;
  const enemyReward = Math.floor(15 + safeWave * 8) || 23;

  // Validate all values are positive numbers
  const validatedConfig = {
    enemyCount: Number.isFinite(enemyCount) && enemyCount > 0 ? enemyCount : safeWave,
    enemyHealth: Number.isFinite(enemyHealth) && enemyHealth > 0 ? enemyHealth : 50,
    enemySpeed: Number.isFinite(enemySpeed) && enemySpeed > 0 ? enemySpeed : 0.15,
    enemyReward: Number.isFinite(enemyReward) && enemyReward > 0 ? enemyReward : 20,
    spawnDelay: Number.isFinite(spawnDelay) && spawnDelay > 0 ? spawnDelay : 500,
    batchSize: Math.max(1, batchSize),
  };

  console.log('[WAVE CONFIG]', safeWave, validatedConfig);

  return validatedConfig;
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
  const defaultPos = { x: 0, y: 30 };
  const startPos = path.length > 0 ? getPositionOnPath(path, 0) : defaultPos;

  // Get enemy type for variety
  const enemyType = getEnemyType(wave, enemyIndex);

  const health = Math.max(1, Math.floor(config.enemyHealth * enemyType.healthMultiplier));
  const speed = Math.max(0.05, config.enemySpeed * enemyType.speed);
  const reward = Math.max(10, Math.floor(config.enemyReward * enemyType.healthMultiplier));

  return {
    id,
    position: { x: startPos.x ?? defaultPos.x, y: startPos.y ?? defaultPos.y },
    health,
    maxHealth: health,
    speed,
    pathIndex: 0,
    reward,
    enemyType: enemyType.name,
    color: enemyType.color,
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
    { size: 1, speed: 1, healthMultiplier: 1, name: 'scout', color: '#ef4444' },        // Red - basic
    { size: 1.15, speed: 0.85, healthMultiplier: 1.4, name: 'soldier', color: '#f97316' }, // Orange
    { size: 0.85, speed: 1.3, healthMultiplier: 0.75, name: 'runner', color: '#eab308' },  // Yellow - fast
    { size: 1.3, speed: 0.7, healthMultiplier: 2, name: 'heavy', color: '#dc2626' },       // Dark red
    { size: 1.6, speed: 0.5, healthMultiplier: 4, name: 'boss', color: '#7c2d12' },        // Brown - boss
    { size: 1.5, speed: 0.4, healthMultiplier: 3, name: 'tank', color: '#1e40af' },        // Blue - slow tank
    { size: 0.7, speed: 1.5, healthMultiplier: 0.5, name: 'swarm', color: '#ec4899' },     // Pink - fast swarm
    { size: 1.4, speed: 0.9, healthMultiplier: 2.5, name: 'elite', color: '#7c3aed' },     // Purple - elite
  ];

  // Every 5th wave starts with a boss
  if (wave % 5 === 0 && index === 0) {
    return types[4]; // Boss
  }

  // Wave 7+ introduces Elites (every 8th enemy)
  if (wave >= 7 && index > 0 && index % 8 === 0) {
    return types[7]; // Elite
  }

  // Wave 5+ introduces Tanks (every 7th enemy)
  if (wave >= 5 && index > 0 && index % 7 === 0) {
    return types[5]; // Tank
  }

  // Wave 4+ introduces Swarm enemies (every 3rd enemy in groups)
  if (wave >= 4 && index % 3 === 2) {
    return types[6]; // Swarm
  }

  // Wave 3+ introduces Heavies (every 5th enemy)
  if (wave >= 3 && index > 0 && index % 5 === 0) {
    return types[3]; // Heavy
  }

  // Mix of regular types based on index (scout, soldier, runner)
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
