import { Environment } from "aws-cdk-lib";

export interface SimpleQueueServiceProps {
    variables: any
    env: Environment
}