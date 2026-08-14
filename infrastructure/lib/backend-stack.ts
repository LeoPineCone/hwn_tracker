import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { FunctionUrlAuthType, HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';

export interface BackendStackProps extends cdk.StackProps {
  appEnv: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const backendFunction = new NodejsFunction(this, 'BackendFunction', {
      entry: path.join(__dirname, '../../backend/src/handler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      environment: {
        APP_ENV: props.appEnv,
      },
    });

    const functionUrl = backendFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [HttpMethod.ALL],
      },
    });

    new cdk.CfnOutput(this, 'BackendUrl', {
      value: functionUrl.url,
    });
  }
}
