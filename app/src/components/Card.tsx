import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function Card({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <View className="m-4 rounded-xl border border-black/10 p-4">
      {children}
    </View>
  );
}
