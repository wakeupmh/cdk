import { Construct } from "constructs";

export default class SimpleQueueService extends Construct {
    constructor(scope: Construct, id: string, props: any) {

        super(scope, id);

        // here you can put all your sqs resources based on the use case
    }
}