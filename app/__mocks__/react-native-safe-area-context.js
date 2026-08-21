// Flattens the default export from the package's own jest mock
// (`react-native-safe-area-context/jest/mock`) onto `module.exports` so that
// named imports (`import { SafeAreaProvider } from '...'`) resolve correctly
// under Jest/Babel CJS interop. Without this, SafeAreaProvider never renders
// its children in tests because it never receives layout-derived insets.
module.exports = require('react-native-safe-area-context/jest/mock').default;
