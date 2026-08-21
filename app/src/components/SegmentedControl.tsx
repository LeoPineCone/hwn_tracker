import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type SegmentOption<T extends string> = { id: T; label: string };

const TRACK_CLASS = 'flex-row rounded-full bg-surface p-1';
const SEGMENT_BASE = 'flex-1 items-center rounded-full py-3';
const SEGMENT_ACTIVE = `${SEGMENT_BASE} bg-bg`;
const LABEL_BASE = 'text-[15px] font-semibold';
const LABEL_ACTIVE = `${LABEL_BASE} text-text`;
const LABEL_INACTIVE = `${LABEL_BASE} text-neutral-600`;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testIDPrefix,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testIDPrefix: string;
}): React.JSX.Element {
  return (
    <View className={TRACK_CLASS} accessibilityRole="tablist">
      {options.map(option => {
        const isActive = option.id === value;
        return (
          <Pressable
            key={option.id}
            className={isActive ? SEGMENT_ACTIVE : SEGMENT_BASE}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            testID={`${testIDPrefix}-${option.id}`}
            onPress={() => onChange(option.id)}>
            <Text className={isActive ? LABEL_ACTIVE : LABEL_INACTIVE}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
