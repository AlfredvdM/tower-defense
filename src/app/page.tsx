'use client';

import { TowerDefenseGame } from '@/components/TowerDefenseGame';
import { DEFAULT_CONFIG } from '@/types/game';

export default function Home() {
  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-gray-950">
      <TowerDefenseGame config={DEFAULT_CONFIG} />
    </main>
  );
}
