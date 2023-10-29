import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export default class InternetFacingApplicationLoadBalancer extends Construct {
  constructor(scope: Construct, id: string, resources: { vpc: IVpc, ec2AutoScalingGroup: AutoScalingGroup }) {
    super(scope, id);

    const loadBalancer = new ApplicationLoadBalancer(this, "appLoadBalancer", {
      vpc: resources.vpc,
      internetFacing: true,
    });
    
    const httpListener = loadBalancer.addListener("httpListener", {
      port: 80,
      open: true,
    });

    httpListener.addTargets('ApplicationSpotFleet', {
        port: 8080,
        targets: [resources.ec2AutoScalingGroup],
    });
  }
}
