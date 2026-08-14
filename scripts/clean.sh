#!/usr/bin/env bash
set -uo pipefail

echo "Stopping HWN Tracker dev environment..."

# Kill whatever is listening on the Metro bundler and backend ports
for PORT in 8081 3000; do
  PID=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "Killing process on port $PORT (PID $PID)"
    kill $PID 2>/dev/null || true
  else
    echo "No process found on port $PORT"
  fi
done

# Kill any leftover Metro / React Native CLI / backend dev processes
pkill -f "react-native start" 2>/dev/null && echo "Killed react-native start process(es)" || true
pkill -f "metro" 2>/dev/null || true
pkill -f "tsx watch local/server.ts" 2>/dev/null && echo "Killed backend dev process(es)" || true

# Kill any in-flight iOS builds
pkill -f "xcodebuild" 2>/dev/null && echo "Killed xcodebuild process(es)" || true

# Shut down all booted iOS simulators and quit the Simulator app
if command -v xcrun >/dev/null 2>&1; then
  echo "Shutting down iOS simulators"
  xcrun simctl shutdown all 2>/dev/null || true
fi
osascript -e 'quit app "Simulator"' 2>/dev/null || true

# Kill the Android emulator / adb server, if the Android SDK is set up
if command -v adb >/dev/null 2>&1; then
  echo "Killing adb server"
  adb kill-server 2>/dev/null || true
fi
pkill -f "emulator64" 2>/dev/null || true
pkill -f "qemu-system" 2>/dev/null || true

# Reset watchman's view of the app, if installed (avoids stale file watches)
if command -v watchman >/dev/null 2>&1; then
  echo "Resetting watchman watch"
  watchman watch-del "$(cd "$(dirname "$0")/.." && pwd)/app" >/dev/null 2>&1 || true
fi

echo "Clean state restored."
