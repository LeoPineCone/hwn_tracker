module.exports = {
  dependencies: {
    // Pulled in transitively as a static require target for nativewind's
    // dead animation code paths (we don't use animation utilities). Its
    // native side isn't compatible with the react-native-worklets version
    // RN 0.87 needs, so it's excluded from autolinking on both platforms.
    'react-native-reanimated': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
};
