'use client';

import { TowerDefenseGame } from '@/components/TowerDefenseGame';
import { DEFAULT_CONFIG } from '@/types/game';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <TowerDefenseGame config={DEFAULT_CONFIG} />
    </main>
  );
}
