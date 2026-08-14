import React, { useCallback, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>HWN Tracker</Text>
      <Card>
        <Text style={styles.label}>Backend status</Text>
        <Text style={styles.value}>{describe(backendState)}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
});
