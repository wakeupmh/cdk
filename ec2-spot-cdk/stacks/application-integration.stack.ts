import { StackProps, Environment, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import InternetFacingApplicationLoadBalancer from '../lib/application-load-balancer/internet-facing-application-load-balancer'
import ApplicationAutoScalingGroup from '../lib/ec2/auto-scaling-group'
import DefaultVpc from '../lib/vpc/default-vpc'

export interface IStackProps extends StackProps {
  variables?: any
  env: Environment
}

export class ApplicationIntegrationStack extends Stack {
  constructor(scope: Construct, id: string, props: IStackProps) {
    super(scope, id, props)

    const { vpc } = new DefaultVpc(this, 'DefaultVpc')
    const { autoScalingGroup } = new ApplicationAutoScalingGroup(this, 'ApplicationAutoScalingGroup', { vpc })
    new InternetFacingApplicationLoadBalancer(this, 'InternetFacingApplicationLoadBalancer', { vpc, ec2AutoScalingGroup: autoScalingGroup })
  }
}
