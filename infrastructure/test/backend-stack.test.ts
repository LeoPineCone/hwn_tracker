import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';
import { BackendStack } from '../lib/backend-stack';

describe('BackendStack', () => {
  it('creates a Lambda function with a public function URL', () => {
    const app = new cdk.App();
    const stack = new BackendStack(app, 'TestStack', {
      appEnv: 'test',
      env: { region: 'eu-central-1' },
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.hasResourceProperties('AWS::Lambda::Url', {
      AuthType: 'NONE',
    });
  });
});
