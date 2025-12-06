export interface TowerDefenseConfig {
  brand: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
  };
  copy: {
    startHeadline: string;
    winHeadline: string;
    loseHeadline: string;
    gameElements: string[]; // Products -> Tower names
  };
  settings: {
    startingMoney: number;
    totalWaves: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Tower {
  id: string;
  name: string;
  position: Position;
  range: number;
  damage: number;
  fireRate: number;
  cost: number;
  lastFired: number;
  level: number;
  color: string;
}

export interface Enemy {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  reward: number;
  enemyType: string;
  color: string;
}

export interface Projectile {
  id: string;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  velocityX?: number;
  velocityY?: number;
  color: string;
  isBeam?: boolean;
  sourcePosition?: Position;
}

export interface ExplosionEffect {
  id: string;
  position: Position;
  color: string;
}

export interface FloatingText {
  id: string;
  position: Position;
  amount: number;
  color: string;
}

export interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  money: number;
  lives: number;
  wave: number;
  score: number;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: ExplosionEffect[];
  floatingTexts: FloatingText[];
  selectedTower: string | null;
}

export interface PathPoint {
  x: number;
  y: number;
}

export const DEFAULT_CONFIG: TowerDefenseConfig = {
  brand: {
    name: 'Your Company',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
  },
  copy: {
    startHeadline: 'Defend Your Business!',
    winHeadline: 'Victory! Your services saved the day!',
    loseHeadline: 'Game Over! Try again?',
    gameElements: ['Analytics', 'Security', 'Support', 'Marketing'],
  },
  settings: {
    startingMoney: 500,
    totalWaves: 10,
    difficulty: 'medium',
  },
};
