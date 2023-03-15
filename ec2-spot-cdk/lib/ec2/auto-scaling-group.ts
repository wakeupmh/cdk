import { Duration } from "aws-cdk-lib";
import { AutoScalingGroup, HealthCheck } from "aws-cdk-lib/aws-autoscaling";
import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IVpc,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export default class ApplicationAutoScalingGroup extends Construct {
  public readonly autoScalingGroup: AutoScalingGroup;
  constructor(
    scope: Construct,
    id: string,
    resources: { vpc: IVpc }
  ) {
    super(scope, id);

    const applicationAutoScalingGroup = new AutoScalingGroup(this, "AutoScalingGroup", {
      vpc: resources.vpc,
      instanceType: InstanceType.of(
        InstanceClass.BURSTABLE4_GRAVITON,
        InstanceSize.MICRO
      ),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      allowAllOutbound: true,
      maxCapacity: 2,
      minCapacity: 1,
      desiredCapacity: 1,
      spotPrice: "0.007", // $0.0032 per Hour when writing, $0.0084 per Hour on-demand
      healthCheck: HealthCheck.ec2(),
    });

    applicationAutoScalingGroup.scaleOnCpuUtilization("CpuScaling", {
        targetUtilizationPercent: 50,
        cooldown: Duration.minutes(1),
        estimatedInstanceWarmup: Duration.minutes(1),
    });

    this.autoScalingGroup = applicationAutoScalingGroup;
  }
}
