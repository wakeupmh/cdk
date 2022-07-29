import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

export abstract class ParameterHelper {
  static getParameter(scope: Construct, name: string, id = '') {
    if (id === '') id = name.replace('/', '')
    return StringParameter.fromStringParameterName(scope, id, name).stringValue
  }

  static putParameter(scope: Construct, name: string, value: string) {
    new StringParameter(scope, name.replace('/', ''), {
      stringValue: value,
      parameterName: name,
    })
  }

  static createSecret(scope: Construct, name: string) {
    new Secret(scope, name.replace('/', ''), {
      secretName: name,
    })
  }
}
