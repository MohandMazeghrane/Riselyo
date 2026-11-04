import type { ReactNode } from 'react';

/** Mouth curve for moods 1 to 5: from a frown to a wide smile (stroke icons, never emoji). */
const MOUTHS = [
  'M8 17 Q12 13 16 17',
  'M8 16.5 Q12 14.5 16 16.5',
  'M8 15.5 L16 15.5',
  'M8 14.5 Q12 16.5 16 14.5',
  'M7.5 14 Q12 18.5 16.5 14',
] as const;

export function MoodFace({ mood }: { readonly mood: number }): ReactNode {
  const mouth = MOUTHS[mood - 1] ?? MOUTHS[2];
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-8 fill-none stroke-current stroke-[1.5]"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="9" cy="10" r="0.9" className="fill-current stroke-none" />
      <circle cx="15" cy="10" r="0.9" className="fill-current stroke-none" />
      <path d={mouth} />
    </svg>
  );
}
