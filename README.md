# HWN Tracker

React Native app + serverless Express backend + AWS CDK infrastructure. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the technical setup and [`AGENTS.md`](./AGENTS.md) for contributor/agent conventions.

```
app/             React Native app (iOS + Android)
backend/         Express app, packaged for AWS Lambda
infrastructure/  AWS CDK (TypeScript)
```

## Prerequisites

- Node.js 24.x (see `.nvmrc`) — `nvm use`
- For iOS: Xcode + CocoaPods (`sudo gem install cocoapods`)
- For Android: Android Studio with an emulator/SDK configured
- AWS CLI + credentials configured, only needed if you plan to run `cdk synth`/`deploy` against a real account

## Install

```sh
# backend + infrastructure (npm workspaces)
npm install

# app has its own toolchain and is not part of the npm workspaces
cd app && npm install
```

## Running the app

```sh
cd app
npm start          # Metro bundler
npm run android     # in a second terminal
npm run ios         # or this, instead
```

Or from the repo root, using the convenience scripts that delegate into `app/` (still requires `npm install` inside `app/` first):

```sh
npm start
npm run android
npm run ios
```

The app calls the backend's `/health` endpoint from the home screen. For that to work locally, start the backend first (see below) — `app/src/config.ts` already points at the right local URL for both the Android emulator (`10.0.2.2`) and the iOS Simulator (`localhost`).

## Running the backend locally

```sh
cd backend
npm run dev   # starts on http://localhost:3000
```

```sh
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

## Infrastructure (AWS CDK)

```sh
cd infrastructure
npx cdk synth --context APP_ENV=dev
```

This bundles the backend Lambda and renders the CloudFormation template — it does not touch AWS. Deploying is a deliberate, manual step:

```sh
npx cdk deploy --context APP_ENV=dev
```

## Tests

```sh
# backend + infrastructure
npm test

# app
cd app && npm test
```

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: backend + infrastructure tests, app tests, and `cdk synth` (no deploy).
