import { StackProps, Environment, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import RootSimpleQueueService from '../lib/root-sqs'

export interface IStorageStackProps extends StackProps {
  variables?: any
  env: Environment
}

export class ApplicationIntegrationStack extends Stack {
  constructor(scope: Construct, id: string, props: IStorageStackProps) {
    super(scope, id, props)

    new RootSimpleQueueService(this, `root-simple-queue-service`, {
      variables: props.variables,
      env: props.env,
    })
  }
}
