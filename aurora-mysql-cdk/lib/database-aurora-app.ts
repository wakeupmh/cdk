import { Environment, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { AuroraMySqlStorage } from '../stacks/aurora-mysql-storage.stack'
import { StorageStack } from '../stacks/storage.stack'

export interface TransactionsPaymentAppProps {
  env: Environment
  variables?: any
}

export class DatabaseAuroraApp extends Construct {
  constructor(scope: Construct, id: string, props: TransactionsPaymentAppProps) {
    super(scope, id)

    const databases: string[] = props.variables.databases
    databases.forEach(database => {
      const stack = new StorageStack(this, `${database}-storage`, {
        stackName: String(props.variables.serviceName).concat(`-${database}-aurora-storage`),
        env: props.env,
        variables: props.variables,
        databaseName: database,
      })
      new AuroraMySqlStorage(this, `${database}-aurora-mysql-storage`, {
        stackName: String(props.variables.serviceName).concat(`-${database}-aurora-mysql-storage`),
        env: props.env,
        variables: props.variables,
        databaseName: database,
      })
      Tags.of(stack).add('database', database)
    })
  }
}
