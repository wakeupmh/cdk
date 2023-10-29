import { IVpc, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export default class DefaultVpc extends Construct {
  public readonly vpc: IVpc;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.vpc = new Vpc(this, "my-vpc", {
      cidr: "10.0.0.1/24",
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: "public subnet",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 28,
          name: "private subnet",
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });

  }
}
