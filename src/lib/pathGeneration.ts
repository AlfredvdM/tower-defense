import { PathPoint } from '@/types/game';

// Generate a winding path for enemies to follow (desktop - landscape)
export function generatePath(gridWidth: number, gridHeight: number): PathPoint[] {
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

// Generate a vertical S-curve path for mobile (square aspect ratio)
export function generateMobilePath(): PathPoint[] {
  const path: PathPoint[] = [
    // Start from top
    { x: 50, y: 0 },
    { x: 50, y: 10 },
    { x: 30, y: 20 },
    { x: 20, y: 30 },
    { x: 30, y: 40 },
    { x: 70, y: 50 },
    { x: 80, y: 60 },
    { x: 70, y: 70 },
    { x: 30, y: 80 },
    { x: 50, y: 90 },
    // End at bottom (base location)
    { x: 50, y: 100 },
  ];

  return path;
}

// Generate SVG path data from points using Catmull-Rom to Bezier conversion
export function pathToSvg(points: PathPoint[]): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    // Get surrounding points for tangent calculation
    const p0 = points[Math.max(0, i - 2)];
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[Math.min(points.length - 1, i + 1)];

    // Catmull-Rom to Bezier control points
    // Tension of 6 gives smooth but not too loose curves
    const tension = 6;
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
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

// Generate an offset path for contour lines (perpendicular offset from original path)
export function generateOffsetPath(points: PathPoint[], offset: number): PathPoint[] {
  return points.map((point, i) => {
    // Get direction vector using adjacent points
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];

    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular normal (rotate 90 degrees)
    const nx = -dy / length;
    const ny = dx / length;

    return {
      x: point.x + nx * offset,
      y: point.y + ny * offset,
    };
  });
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
