import { CfnOutput } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export default class SimpleQueueService extends Construct {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    const deadLetterQueue = new Queue(this, "dlq", {
      queueName: `my-${props.env}-dlq`,
    });

    const queueName = `my-${props.env}-queue`
    const queue = new Queue(this, 'analytics-event-processor', {
      queueName,
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 3, //The number of times a message can be unsuccessfully dequeued 
      },
    })
    //these following lines are just to make the output and you can use in another projects
    new CfnOutput(this, 'application-integration', {
      value: queue.queueArn,
      exportName: `application-integration::${queueName}::arn`,
    })
    
  }
}
