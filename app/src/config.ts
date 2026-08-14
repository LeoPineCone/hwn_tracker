import { Platform } from 'react-native';

// Android emulator can't reach the host machine via `localhost` — 10.0.2.2 is
// the documented alias for the host loopback interface. iOS simulator shares
// the host network directly, so `localhost` works there.
const LOCAL_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_BASE_URL = LOCAL_API_BASE_URL;
