import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib/core';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

export class CrudApi extends RestApi {
  public lambdaFunction: lambda.Function;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an AWS Lambda function
    const lambdaFunction = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'), // Provide the path to your Lambda code
    });

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'MyApi');

    // Create a resource for your API
    const resource = api.root.addResource('myresource');

    // Add a method to the resource (e.g., GET)
    const integration = new apigateway.LambdaIntegration(lambdaFunction);
    resource.addMethod('GET', integration);

    // Grant necessary permissions for the Lambda function
    lambdaFunction.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    this.lambdaFunction = lambdaFunction;
  }
}
