#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();
const appEnv: string = app.node.tryGetContext('APP_ENV') ?? 'dev';

new BackendStack(app, `HwnTracker-Backend-${appEnv}`, {
  env: { region: process.env.CDK_DEFAULT_REGION ?? 'eu-central-1' },
  appEnv,
});
