# AWS CDK Patterns and Best Practices

This reference provides detailed patterns, anti-patterns, and best practices for AWS CDK development.

## Table of Contents

- [Naming Conventions](#naming-conventions)
- [Construct Patterns](#construct-patterns)
- [Security Patterns](#security-patterns)
- [Lambda Integration](#lambda-integration)
- [Testing Patterns](#testing-patterns)
- [Cost Optimization](#cost-optimization)
- [Anti-Patterns](#anti-patterns)

## Naming Conventions

### Explicit Naming is preferred

**Pattern**: Use logical prefixes and environment suffixes

**Benefits**:
- Supports parallel environments (dev, staging, prod)
- Prevents naming conflicts
- Allows stack cloning and testing

```typescript
// Only when absolutely necessary
const bucket = new s3.Bucket(this, 'DataBucket', {
  bucketName:`${PROJECT_QUALIFIER}-${props.stage}-alb-log-bucket`,
});
```

## Construct Patterns

### L3 Constructs (Patterns)

Prefer high-level patterns that encapsulate best practices:

```typescript
import * as patterns from 'aws-cdk-lib/aws-apigateway';

new patterns.LambdaRestApi(this, 'MyApi', {
  handler: myFunction,
  // Includes CloudWatch Logs, IAM roles, and API Gateway configuration
});
```

### Custom Constructs

Create reusable constructs for repeated patterns:

```typescript
export class ApiWithDatabase extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ApiWithDatabaseProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const handler = new NodejsFunction(this, 'Handler', {
      entry: props.handlerEntry,
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });

    this.table.grantReadWriteData(handler);

    this.api = new apigateway.LambdaRestApi(this, 'Api', {
      handler,
    });
  }
}
```

## Security Patterns

### IAM Least Privilege

Use grant methods instead of broad policies:

```typescript
// ✅ GOOD - Specific grants
const table = new dynamodb.Table(this, 'Table', { /* ... */ });
const lambda = new lambda.Function(this, 'Function', { /* ... */ });

table.grantReadWriteData(lambda);

// ❌ BAD - Overly broad permissions
lambda.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:*'],
  resources: ['*'],
}));
```

### Secrets Management

Use Secrets Manager for sensitive data:

```typescript
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

const secret = new secretsmanager.Secret(this, 'DbPassword', {
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: 'admin' }),
    generateStringKey: 'password',
    excludePunctuation: true,
  },
});

// Grant read access to Lambda
secret.grantRead(myFunction);
```

## Lambda Integration

### NodejsFunction (TypeScript/JavaScript)

This project's backend Lambda runs with no VPC (see `ARCHITECTURE.md`) — it's exposed via a Function URL, not API Gateway, and has no need to reach VPC-isolated resources. Don't add `vpc`/`vpcSubnets` unless a future resource genuinely requires network isolation; that's an architecture change, not a default.

```typescript
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';

const fn = new NodejsFunction(this, 'Function', {
    architecture: Architecture.ARM_64,
    entry: 'src/handlers/process.ts',
    handler: 'handler',
    runtime: lambda.Runtime.NODEJS_22_X,
    timeout: Duration.seconds(30),
    memorySize: 512,
    environment: {
        TABLE_NAME: table.tableName,
    },
    bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'], // Use AWS SDK from Lambda runtime
    },
});
```

## Testing Patterns

### Snapshot Testing

```typescript
import { Template } from 'aws-cdk-lib/assertions';

test('Stack creates expected resources', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack');

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
```

### Fine-Grained Assertions

```typescript
test('Lambda has correct environment', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack');

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs20.x',
    Timeout: 30,
    Environment: {
      Variables: {
        TABLE_NAME: { Ref: Match.anyValue() },
      },
    },
  });
});
```

### Resource Count Validation

```typescript
test('Stack has correct number of functions', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack');

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::Lambda::Function', 3);
});
```

## Cost Optimization

### Right-Sizing Lambda

```typescript
// Development
const devFunction = new NodejsFunction(this, 'DevFunction', {
  memorySize: 256, // Lower for dev
  timeout: Duration.seconds(30),
});

// Production
const prodFunction = new NodejsFunction(this, 'ProdFunction', {
  memorySize: 1024, // Higher for prod performance
  timeout: Duration.seconds(10),
  reservedConcurrentExecutions: 10, // Prevent runaway costs
});
```

### DynamoDB Billing Modes

```typescript
// Development/Low Traffic
const devTable = new dynamodb.Table(this, 'DevTable', {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Production/Predictable Load
const prodTable = new dynamodb.Table(this, 'ProdTable', {
  billingMode: dynamodb.BillingMode.PROVISIONED,
  readCapacity: 5,
  writeCapacity: 5,
  autoScaling: { /* ... */ },
});
```

### S3 Lifecycle Policies

```typescript
const bucket = new s3.Bucket(this, 'DataBucket', {
  lifecycleRules: [
    {
      id: 'MoveToIA',
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: Duration.days(30),
        },
        {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: Duration.days(90),
        },
      ],
    },
    {
      id: 'CleanupOldVersions',
      noncurrentVersionExpiration: Duration.days(30),
    },
  ],
});
```

## Anti-Patterns

### ❌ Overly Broad IAM Permissions

```typescript
// BAD
function.addToRolePolicy(new iam.PolicyStatement({
  actions: ['*'],
  resources: ['*'],
}));

// GOOD
table.grantReadWriteData(function);
```

### ❌ Manual Dependency Management

```typescript
// BAD - Manual bundling
new lambda.Function(this, 'Function', {
  code: lambda.Code.fromAsset('lambda.zip'), // Pre-bundled manually
  // ...
});

// GOOD - Let CDK handle it
new NodejsFunction(this, 'Function', {
  entry: 'src/handler.ts',
  // CDK handles bundling automatically
});
```

### ❌ Missing Environment Variables

```typescript
// BAD
new NodejsFunction(this, 'Function', {
  entry: 'src/handler.ts',
  // Table name hardcoded in Lambda code
});

// GOOD
new NodejsFunction(this, 'Function', {
  entry: 'src/handler.ts',
  environment: {
    TABLE_NAME: table.tableName,
  },
});
```

### ❌ Use ParameterStore instead of Outputs for cross-stack references

```typescript
// BAD - No way to reference resources
class MyStack extends Stack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const api = new apigateway.RestApi(this, 'Api', {});

        new CfnOutput(this, 'ApiUrl', {
            value: api.url,
            description: 'API Gateway URL',
            exportName: 'MyApiUrl',
        });
    }
}

// GOOD - Export important values
class MyStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'Api', {});

      new StringParameter(this, 'stage-kms-key-arn', {
          parameterName: `/stage/${props.stage}/resources/api.url`,
          stringValue: api.url,
      });
  }
}
```

## Summary

- **Always** use logical prefixes and environment suffixes in construct names 
- **Use** high-level constructs (L2/L3) over low-level (L1)
- **Prefer** grant methods for IAM permissions
- **Leverage** `NodejsFunction` for automatic bundling
- **Test** stacks with assertions and snapshots
- **Optimize** costs based on environment (dev vs prod)
- **Validate** infrastructure before deployment
- **Document** custom constructs and patterns
