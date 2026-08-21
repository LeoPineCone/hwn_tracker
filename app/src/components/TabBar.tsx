import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from './Icon';
import colors from '../theme/colors.json';

export type TabId = 'map' | 'rewards' | 'profile';

export const TAB_ORDER: readonly TabId[] = ['map', 'rewards', 'profile'];

const TAB_LABELS: Record<TabId, string> = {
  map: 'Karte',
  rewards: 'Erfolge',
  profile: 'Profil',
};

const ACTIVE_ICON_COLOR = colors['accent-2']['800'];
const INACTIVE_ICON_COLOR = colors.neutral['600'];

const TAB_ITEM_BASE = 'flex-1 items-center rounded-md py-[7px]';
const TAB_ITEM_ACTIVE = `${TAB_ITEM_BASE} bg-accent-2-200`;
const TAB_LABEL_BASE = 'text-[10.5px] font-semibold tracking-[0.2px]';
const TAB_LABEL_ACTIVE = `${TAB_LABEL_BASE} text-accent-2-800`;
const TAB_LABEL_INACTIVE = `${TAB_LABEL_BASE} text-neutral-600`;

export function TabBar({
  activeTab,
  onSelect,
}: {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
}): React.JSX.Element {
  return (
    <View
      className="flex-row gap-1 border-t border-text/16 bg-bg px-3 pt-2 pb-2"
      accessibilityRole="tablist">
      {TAB_ORDER.map(id => {
        const isActive = id === activeTab;
        return (
          <Pressable
            key={id}
            className={isActive ? TAB_ITEM_ACTIVE : TAB_ITEM_BASE}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={TAB_LABELS[id]}
            testID={`tab-${id}`}
            onPress={() => onSelect(id)}>
            <Icon
              name={id}
              color={isActive ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR}
            />
            <Text
              className={isActive ? TAB_LABEL_ACTIVE : TAB_LABEL_INACTIVE}>
              {TAB_LABELS[id]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
