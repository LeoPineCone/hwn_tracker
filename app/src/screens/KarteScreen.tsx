import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';

export type KarteView = 'karte' | 'stempel';

const VIEW_OPTIONS: readonly SegmentOption<KarteView>[] = [
  { id: 'karte', label: 'Karte' },
  { id: 'stempel', label: 'Stempel' },
];

export function KarteScreen(): React.JSX.Element {
  const [view, setView] = useState<KarteView>('karte');

  return (
    <ScreenShell title="Karte" testID="screen-karte">
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        testIDPrefix="karte-segment"
      />
      <View className="bg-surface rounded-md p-[18px]">
        <Text testID="karte-view-readout">
          {view === 'karte'
            ? 'Kartenansicht kommt bald.'
            : 'Stempelansicht kommt bald.'}
        </Text>
      </View>
    </ScreenShell>
  );
}
