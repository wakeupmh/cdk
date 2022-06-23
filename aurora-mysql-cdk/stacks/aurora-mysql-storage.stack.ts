import { StackProps, Environment, Stack } from 'aws-cdk-lib'
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'

import { DatabaseAuroraMySQLStorage } from '../lib/database-aurora-mysql-storage'

export interface IStorageStackProps extends StackProps {
  variables?: any
  env: Environment
  databaseName: string
}

export class AuroraMySqlStorage extends Stack {
  constructor(scope: Construct, id: string, props: IStorageStackProps) {
    super(scope, id, props)

    const vpc: IVpc = Vpc.fromLookup(this, 'vpc', {
      tags: { vpcIdentity: props.variables.tagVpc },
    })

    new DatabaseAuroraMySQLStorage(this, `aurora-mysql-storage`, {
      variables: props.variables,
      env: props.env,
      databaseName: props.databaseName,
      vpc,
    })
  }
}
