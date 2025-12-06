export interface TowerType {
  name: string;
  range: number;
  damage: number;
  fireRate: number;
  cost: number;
  color: string;
  description: string;
  projectileSpeed: number;
}

// Unique projectile colors for each tower type (Star Wars style)
const TOWER_COLORS = [
  '#ef4444', // Red - classic blaster
  '#22c55e', // Green - like a lightsaber
  '#3b82f6', // Blue - ion cannon
  '#f59e0b', // Orange/yellow - like Mandalorian blasters
];

// Generate tower stats based on product name and index
// Towers are more powerful with varied specializations
export function generateTowerStats(
  productName: string,
  index: number,
  accentColor: string
): TowerType {
  // Create variation based on index to make each tower unique and powerful
  const variations = [
    {
      rangeBonus: 0,
      damageBonus: 0,
      fireRateBonus: 0,
      costBonus: 0,
      projectileSpeed: 4,
      desc: 'Balanced firepower for reliable defense',
    },
    {
      rangeBonus: 40,
      damageBonus: 10,
      fireRateBonus: -100,
      costBonus: 75,
      projectileSpeed: 5,
      desc: 'Long-range sniper with high precision',
    },
    {
      rangeBonus: -15,
      damageBonus: 40,
      fireRateBonus: 50,
      costBonus: 100,
      projectileSpeed: 3.5,
      desc: 'Heavy cannon with devastating impact',
    },
    {
      rangeBonus: 15,
      damageBonus: -5,
      fireRateBonus: 400,
      costBonus: 125,
      projectileSpeed: 6,
      desc: 'Rapid-fire turret for swarm control',
    },
  ];

  const variation = variations[index % variations.length];

  return {
    name: productName,
    range: 100 + variation.rangeBonus,        // Increased base range
    damage: 35 + variation.damageBonus,        // Much higher base damage
    fireRate: 600 - variation.fireRateBonus,   // Faster base fire rate (lower = faster)
    cost: 80 + variation.costBonus,            // Slightly cheaper to start
    color: TOWER_COLORS[index % TOWER_COLORS.length],
    description: variation.desc,
    projectileSpeed: variation.projectileSpeed,
  };
}

// Get upgrade cost for a tower
export function getUpgradeCost(baseCost: number, level: number): number {
  return Math.floor(baseCost * (0.6 + level * 0.4));
}

// Get upgraded stats - significant power boost per level
export function getUpgradedStats(tower: TowerType, level: number): TowerType {
  return {
    ...tower,
    range: tower.range + level * 15,
    damage: tower.damage + level * 15,
    fireRate: Math.max(150, tower.fireRate - level * 80),
    projectileSpeed: tower.projectileSpeed + level * 0.5,
  };
}
