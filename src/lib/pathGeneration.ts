import { PathPoint } from '@/types/game';

// Generate a winding path for enemies to follow
export function generatePath(gridWidth: number, gridHeight: number): PathPoint[] {
  const cellWidth = 100 / gridWidth;
  const cellHeight = 100 / gridHeight;

  // Create a winding S-curve path
  const path: PathPoint[] = [
    // Start from left edge
    { x: 0, y: 30 },
    { x: 15, y: 30 },
    { x: 25, y: 25 },
    { x: 35, y: 35 },
    { x: 45, y: 50 },
    { x: 55, y: 65 },
    { x: 65, y: 70 },
    { x: 75, y: 60 },
    { x: 85, y: 45 },
    { x: 95, y: 50 },
    // End at right edge (base location)
    { x: 100, y: 50 },
  ];

  return path;
}

// Generate SVG path data from points
export function pathToSvg(points: PathPoint[]): string {
  if (points.length < 2) return '';

  // Use smooth curves between points
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Calculate control points for smooth curves
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
    const cpy2 = curr.y;

    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }

  return d;
}

// Get position along the path at a given progress (0-1)
export function getPositionOnPath(points: PathPoint[], progress: number): PathPoint {
  if (points.length < 2) return points[0] || { x: 0, y: 0 };

  const totalSegments = points.length - 1;
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const localProgress = segmentProgress - segmentIndex;

  const start = points[segmentIndex];
  const end = points[segmentIndex + 1];

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  };
}

// Calculate total path length (approximate)
export function getPathLength(points: PathPoint[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

// Check if a position is on or near the path (for tower placement validation)
export function isOnPath(position: PathPoint, points: PathPoint[], threshold: number = 8): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    // Calculate distance from point to line segment
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) continue;

    const t = Math.max(0, Math.min(1,
      ((position.x - start.x) * dx + (position.y - start.y) * dy) / (length * length)
    ));

    const nearestX = start.x + t * dx;
    const nearestY = start.y + t * dy;

    const distance = Math.sqrt(
      (position.x - nearestX) ** 2 + (position.y - nearestY) ** 2
    );

    if (distance < threshold) return true;
  }

  return false;
}
