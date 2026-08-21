import React from 'react';
import Svg, { Path } from 'react-native-svg';

export type IconName = 'map' | 'stamp' | 'rewards' | 'profile';

// Vendored verbatim from `design/Harzer Wandernadel.dc.html`'s `ICONS` object
// (~line 688). Entries joined with `|` in the source represent multiple
// separate `<path>` elements — split on `|` rather than merged into one `d`.
export const ICON_PATHS: Record<IconName, readonly string[]> = {
  map: ['M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z', 'M12 10h.01'],
  stamp: ['M6 21h12M8 21v-3a4 4 0 0 1-4-4v-1h16v1a4 4 0 0 1-4 4v3M9 10V6.5a3 3 0 0 1 6 0V10'],
  rewards: ['M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM9 14l-2 7 5-3 5 3-2-7'],
  profile: ['M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
};

export function Icon({
  name,
  color,
  size = 21,
  testID,
}: {
  name: IconName;
  color: string;
  size?: number;
  testID?: string;
}): React.JSX.Element {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      testID={testID}>
      {ICON_PATHS[name].map((d, index) => (
        <Path key={index} d={d} />
      ))}
    </Svg>
  );
}
