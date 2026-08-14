import React, { useCallback, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { fetchHealth } from '../services/apiService';

type BackendState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; timestamp: string }
  | { kind: 'error'; message: string };

export function HomeScreen(): React.JSX.Element {
  const [backendState, setBackendState] = useState<BackendState>({
    kind: 'idle',
  });

  const checkBackend = useCallback(async () => {
    setBackendState({ kind: 'loading' });
    try {
      const health = await fetchHealth();
      setBackendState({ kind: 'success', timestamp: health.timestamp });
    } catch (error) {
      setBackendState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="mb-2 text-2xl font-semibold">HWN Tracker</Text>
      <Card>
        <Text className="text-xs opacity-60">Backend status</Text>
        <Text className="mb-3 text-base">{describe(backendState)}</Text>
        <Button title="Check backend" onPress={checkBackend} />
      </Card>
    </View>
  );
}

function describe(state: BackendState): string {
  switch (state.kind) {
    case 'idle':
      return 'Not checked yet';
    case 'loading':
      return 'Checking…';
    case 'success':
      return `OK (${state.timestamp})`;
    case 'error':
      return `Error: ${state.message}`;
  }
}
