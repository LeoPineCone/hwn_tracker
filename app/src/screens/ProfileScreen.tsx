import React from 'react';
import { Text } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';

export function ProfileScreen(): React.JSX.Element {
  return (
    <ScreenShell title="Profil" testID="screen-profile">
      <Text>Diese Ansicht kommt bald.</Text>
    </ScreenShell>
  );
}
