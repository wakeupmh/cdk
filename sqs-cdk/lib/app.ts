import { Environment } from 'aws-cdk-lib'
import { Construct } from 'constructs/lib/construct'
import { ApplicationIntegrationStack } from '../stacks/application-integration.stack'

export interface ContextAppProps {
  env: Environment
  variables?: any
}

export class ContextApp extends Construct {
  constructor(scope: Construct, id: string, props: ContextAppProps) {
    super(scope, id)

    new ApplicationIntegrationStack(this, 'application-integration-stack', {
      env: props.env,
      variables: props.variables,
    })
  }
}
