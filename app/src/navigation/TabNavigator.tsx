import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar, TAB_ORDER, type TabId } from '../components/TabBar';
import { KarteScreen } from '../screens/KarteScreen';
import { ErfolgeScreen } from '../screens/ErfolgeScreen';
import { ProfilScreen } from '../screens/ProfilScreen';

const SCREEN_COMPONENTS: Record<TabId, React.ComponentType> = {
  karte: KarteScreen,
  erfolge: ErfolgeScreen,
  profil: ProfilScreen,
};

export function TabNavigator(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('karte');

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top', 'right', 'bottom', 'left']}>
      <View className="flex-1">
        {TAB_ORDER.map(id => {
          const isActive = id === activeTab;
          const Screen = SCREEN_COMPONENTS[id];
          return (
            <View
              key={id}
              className="flex-1"
              testID={`tabslot-${id}`}
              // Layout visibility toggle, not a design token — screens must
              // stay mounted (not conditionally rendered) so their internal
              // state survives tab switches. Intentional exception to the
              // NativeWind-only styling convention.
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ display: isActive ? 'flex' : 'none' }}
              accessibilityElementsHidden={!isActive}
              importantForAccessibility={
                isActive ? 'auto' : 'no-hide-descendants'
              }>
              <Screen />
            </View>
          );
        })}
      </View>
      <TabBar activeTab={activeTab} onSelect={setActiveTab} />
    </SafeAreaView>
  );
}
