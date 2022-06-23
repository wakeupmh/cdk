import { Environment, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { InstanceType, IVpc, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import {
  DatabaseClusterEngine,
  SubnetGroup,
  DatabaseCluster,
  ParameterGroup,
  AuroraMysqlEngineVersion,
} from 'aws-cdk-lib/aws-rds'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

import { ParameterHelper } from './cdk-helpers/ssm-helper'

export interface DatabaseAuroraAppProps {
  env: Environment
  variables?: any
  databaseName: string
  vpc: IVpc
}

export class DatabaseAuroraMySQLStorage extends Construct {
  variables: any
  instanceName: string

  constructor(scope: Construct, id: string, props: DatabaseAuroraAppProps) {
    super(scope, id)

    this.variables = props.variables
    this.instanceName = `${props.databaseName}-aurora-mysql`
    const databaseUsername = 'admin'
    const clusterName = `${this.instanceName}-cluster-aurora-mysql`

    const securityGroup = new SecurityGroup(this, id.concat(`${this.instanceName}-sg`), {
      vpc: props.vpc,
      description: `${this.instanceName}-instance-sg`,
      securityGroupName: `${this.instanceName}-instance-sg`,
      allowAllOutbound: true,
    })

    ParameterHelper.putParameter(
      this,
      `/database/aurora/default/sg/${this.instanceName}/id`,
      securityGroup.securityGroupId,
    )

    const databaseCredentialsSecret = new Secret(this, 'DBCredentialsSecret', {
      secretName: `${this.instanceName}-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: databaseUsername,
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    })
    /** Version "8.0.mysql_aurora.3.01.0". */
    const dbEngine = DatabaseClusterEngine.auroraMysql({ version: AuroraMysqlEngineVersion.VER_3_01_0 })

    const parameterGroupForCluster = new ParameterGroup(this, `${clusterName}-${dbEngine.engineVersion?.fullVersion}`, {
      engine: dbEngine,
      description: `Aurora RDS Cluster Parameter Group for database ${props.databaseName}`,
    })

    /**
     let's suppose you need to create a trigger on your database,
     this custom parameter group it's responsible to perform this with the following parameter log_bin_trust_function_creators,
     because the default parameter group is not editable
    */
    const parameterGroupForInstance = new ParameterGroup(
      this,
      `${this.instanceName}-${dbEngine.engineVersion?.fullVersion}`,
      {
        engine: dbEngine,
        description: `Aurora RDS Instance Parameter Group for database ${this.instanceName}`,
        parameters: {
          log_bin_trust_function_creators: '1',
        },
      },
    )

    const aurora = new DatabaseCluster(this, clusterName, {
      engine: dbEngine,
      instanceProps: {
        instanceType: new InstanceType(props.variables.instanceType),
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        securityGroups: [securityGroup],
        parameterGroup: parameterGroupForInstance,
      },
      backup: {
        retention: Duration.days(props.variables.backupRetention),
        preferredWindow: props.variables.backupPreferredWindow,
      },
      credentials: {
        username: databaseUsername,
        password: databaseCredentialsSecret.secretValueFromJson('password'),
      },
      instances: props.variables.instances,
      cloudwatchLogsRetention: RetentionDays.ONE_WEEK,
      defaultDatabaseName: props.databaseName,
      iamAuthentication: false,
      clusterIdentifier: `${props.databaseName}-aurora-mysql`,
      subnetGroup: this.createSubnetGroup(props.vpc),
      parameterGroup: parameterGroupForCluster,
    })

    ParameterHelper.putParameter(
      this,
      `/database/aurora/${this.instanceName}/secret/arn`,
      databaseCredentialsSecret.secretArn,
    )

    ParameterHelper.putParameter(
      this,
      `/database/aurora/${this.instanceName}/hostname`,
      aurora.clusterEndpoint.hostname,
    )
  }

  // you need to create a subnet group for your database
  private createSubnetGroup(vpc: IVpc) {
    return new SubnetGroup(this, 'aurora-rds-subnet-group', {
      description: `Aurora RDS Subnet Group for database ${this.instanceName}`,
      subnetGroupName: 'aurora-rds-subnet-group',
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      vpcSubnets: {
        subnets: vpc.isolatedSubnets,
      },
    })
  }
}
