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
        snapshotId: appSettings.staging.snapshotId,
        databases: appSettings.auroraDatabase.instances,
        auroraPause: appSettings.staging.auroraPause,
        instanceType: appSettings.staging.instanceType,
        instances: appSettings.staging.instances,
        backupRetention: appSettings.staging.backupRetention,
        backupPreferredWindow: appSettings.staging.backupPreferredWindow,
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
        snapshotId: appSettings.prod.snapshotId,
        databases: appSettings.auroraDatabase.instances,
        auroraPause: appSettings.prod.auroraPause,
        instanceType: appSettings.prod.instanceType,
        instances: appSettings.prod.instances,
        backupRetention: appSettings.prod.backupRetention,
        backupPreferredWindow: appSettings.prod.backupPreferredWindow,
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
      snapshotId: appSettings.dev.snapshotId,
      databases: appSettings.auroraDatabase.instances,
      auroraPause: appSettings.dev.auroraPause,
      instances: appSettings.dev.instances,
      instanceType: appSettings.dev.instanceType,
      backupRetention: appSettings.dev.backupRetention,
      backupPreferredWindow: appSettings.dev.backupPreferredWindow,
    },
  }
}
