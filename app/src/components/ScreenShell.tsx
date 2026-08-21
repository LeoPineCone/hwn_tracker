import React from 'react';
import { Text, View } from 'react-native';

export function ScreenShell({
  title,
  testID,
  children,
}: {
  title: string;
  testID: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="flex-1 bg-bg px-4 pt-2" testID={testID}>
      <Text className="text-[11px] font-semibold uppercase tracking-[1.3px] text-neutral-600">
        Harzer Wandernadel
      </Text>
      <Text className="text-[26px] font-bold text-text">{title}</Text>
      {children}
    </View>
  );
}
