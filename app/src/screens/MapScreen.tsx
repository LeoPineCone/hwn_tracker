import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';

export type MapViewMode = 'map' | 'stamp';

const VIEW_OPTIONS: readonly SegmentOption<MapViewMode>[] = [
  { id: 'map', label: 'Karte' },
  { id: 'stamp', label: 'Stempel' },
];

export function MapScreen(): React.JSX.Element {
  const [view, setView] = useState<MapViewMode>('map');

  return (
    <ScreenShell title="Karte" testID="screen-map">
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        testIDPrefix="map-segment"
      />
      <View className="bg-surface rounded-md p-[18px]">
        <Text testID="map-view-readout">
          {view === 'map'
            ? 'Kartenansicht kommt bald.'
            : 'Stempelansicht kommt bald.'}
        </Text>
      </View>
    </ScreenShell>
  );
}
