'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { TowerDefenseGame } from '@/components/TowerDefenseGame';
import { DEFAULT_CONFIG, TowerDefenseConfig } from '@/types/game';

function parseConfigFromURL(configParam: string | null): Partial<TowerDefenseConfig> | null {
  if (!configParam) return null;
  try {
    const decoded = atob(configParam);
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Failed to parse config from URL:', e);
    return null;
  }
}

function mergeConfig(urlConfig: Partial<TowerDefenseConfig> | null): TowerDefenseConfig {
  if (!urlConfig) return DEFAULT_CONFIG;
  return {
    brand: { ...DEFAULT_CONFIG.brand, ...urlConfig.brand },
    copy: { ...DEFAULT_CONFIG.copy, ...urlConfig.copy },
    settings: { ...DEFAULT_CONFIG.settings, ...urlConfig.settings },
  };
}

function GameWithConfig() {
  const searchParams = useSearchParams();
  const configParam = searchParams.get('config');

  const config = useMemo(() => {
    const urlConfig = parseConfigFromURL(configParam);
    return mergeConfig(urlConfig);
  }, [configParam]);

  return <TowerDefenseGame config={config} />;
}

export default function Home() {
  return (
    <main className="w-screen h-[100dvh] overflow-hidden bg-gray-950">
      <Suspense fallback={<div className="w-full h-full bg-gray-950" />}>
        <GameWithConfig />
      </Suspense>
    </main>
  );
}
