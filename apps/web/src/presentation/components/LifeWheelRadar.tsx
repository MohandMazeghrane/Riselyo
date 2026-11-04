import type { ReactNode } from 'react';

export interface RadarAxis {
  readonly label: string;
  readonly score: number;
}

interface LifeWheelRadarProps {
  readonly axes: readonly RadarAxis[];
  readonly maxScore: number;
  readonly title: string;
}

const WIDTH = 360;
const HEIGHT = 320;
const CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const RADIUS = 95;
const LABEL_RADIUS = 118;
const RINGS = [0.2, 0.4, 0.6, 0.8, 1];
const QUARTER_TURN = Math.PI / 2;

function pointAt(index: number, count: number, distance: number): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / count - QUARTER_TURN;
  return { x: CENTER.x + distance * Math.cos(angle), y: CENTER.y + distance * Math.sin(angle) };
}

function polygon(count: number, distanceOf: (index: number) => number): string {
  return Array.from({ length: count }, (_, index) => {
    const { x, y } = pointAt(index, count, distanceOf(index));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

/** Hand-drawn SVG radar: no chart library needed for 8 axes. */
export function LifeWheelRadar({ axes, maxScore, title }: LifeWheelRadarProps): ReactNode {
  const count = axes.length;
  return (
    <svg
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
      role="img"
      aria-label={title}
      className="w-full"
    >
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygon(count, () => RADIUS * ring)}
          className="fill-none stroke-slate-200"
        />
      ))}
      <polygon
        points={polygon(count, (index) => (RADIUS * (axes[index]?.score ?? 0)) / maxScore)}
        className="fill-brand-600/25 stroke-brand-600 stroke-2"
      />
      {axes.map((axis, index) => (
        <AxisLabel
          key={axis.label}
          label={axis.label}
          position={pointAt(index, count, LABEL_RADIUS)}
        />
      ))}
    </svg>
  );
}

function AxisLabel({
  label,
  position,
}: {
  label: string;
  position: { x: number; y: number };
}): ReactNode {
  const anchor =
    Math.abs(position.x - CENTER.x) < 1 ? 'middle' : position.x > CENTER.x ? 'start' : 'end';
  return (
    <text
      x={position.x}
      y={position.y}
      textAnchor={anchor}
      dominantBaseline="middle"
      className="fill-slate-700 text-[11px]"
    >
      {label}
    </text>
  );
}
