'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  fps?: number;
  paused?: boolean;
}

export function useGameLoop({ onUpdate, fps = 60, paused = false }: UseGameLoopOptions) {
  const frameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const intervalMs = 1000 / fps;

  const loop = useCallback((currentTime: number) => {
    if (paused) {
      frameRef.current = requestAnimationFrame(loop);
      lastTimeRef.current = currentTime;
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime >= intervalMs) {
      onUpdate(deltaTime);
      lastTimeRef.current = currentTime - (deltaTime % intervalMs);
    }

    frameRef.current = requestAnimationFrame(loop);
  }, [onUpdate, intervalMs, paused]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [loop]);

  return {
    pause: () => {},
    resume: () => {},
  };
}
