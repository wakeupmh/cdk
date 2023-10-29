import { Stack, StackProps } from "aws-cdk-lib"
import { CrudApi } from "./api/rest-api"
import { Construct } from "constructs"
import { Monitoring } from "./monitoring/dashboard"
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb"

export class CrudApiStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const crudApi = new CrudApi(this, 'RestApiStack')
    const orderTable = new Table(this, 'OrderTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    })
    const idempotencyTable = new Table(this, 'IdempotencyTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    })
    new Monitoring(this, 'MonitoringStack', crudApi, orderTable, idempotencyTable, [crudApi.lambdaFunction])
  }
}