import { Environment } from 'aws-cdk-lib'

import { CONFIGS } from '../config'

const appSettings = CONFIGS

interface IStartVariables {
  variables: any
  env: Environment
}
export const buildEnvironment = (): IStartVariables => {
  if (process?.env?.environment?.toLowerCase() === 'stage') {
    return {
      env: {
        account: appSettings.staging.account,
        region: appSettings.staging.region,
      },
      variables: {
        ssmParameters: appSettings.ssmParameters,
        projectName: appSettings.projectName,
        serviceName: appSettings.serviceName,
        tagVpc: appSettings.vpc.tagVpc,
      },
    }
  }
  if (process?.env?.environment?.toLowerCase() === 'prod') {
    return {
      env: {
        account: appSettings.prod.account,
        region: appSettings.prod.region,
      },
      variables: {
        ssmParameters: appSettings.ssmParameters,
        projectName: appSettings.projectName,
        serviceName: appSettings.serviceName,
        tagVpc: appSettings.vpc.tagVpc,
      },
    }
  }
  return {
    env: {
      account: appSettings.dev.account,
      region: appSettings.dev.region,
    },
    variables: {
      ssmParameters: appSettings.ssmParameters,
      projectName: appSettings.projectName,
      serviceName: appSettings.serviceName,
      tagVpc: appSettings.vpc.tagVpc,
    },
  }
}
