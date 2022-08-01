import { Construct } from "constructs";
import { SimpleQueueServiceProps } from "./cdk-base/sqs-props.interface";
import SimpleQueueService from "./sqs/simple-queue-service";

export default class RootSimpleQueueService extends Construct {
  props: SimpleQueueServiceProps;
  constructor(scope: Construct, id: string, props: SimpleQueueServiceProps) {
    super(scope, id);

    this.props = props;

    this.sqs()
  }

  private sqs() {
    new SimpleQueueService(this, `simple-queue-service`, this.props)
    // here you can put all your sqs resources based on the use case
  }
}
