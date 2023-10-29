import { RestApi } from 'aws-cdk-lib/aws-apigateway'
import { BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Function } from 'aws-cdk-lib/aws-lambda'

import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib/core';
import {
  AlarmFactoryDefaults,
  CustomMetricGroup,
  MetricStatistic,
  MonitoringFacade,
  SnsAlarmActionStrategy,
} from 'cdk-monitoring-constructs';
import { constants } from './constants'
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class Monitoring extends Construct {
  private notificationTopic: Topic;
  constructor(
    scope: Construct,
    id: string,
    crudApi: RestApi,
    db: Table,
    idempotencyTable: Table,
    functions: Function[]
  ) {
    super(scope, id);

    this.notificationTopic = this.buildTopic();
    this.buildHighLevelDashboard(crudApi, this.notificationTopic);
    this.buildLowLevelDashboard(db, idempotencyTable, functions, this.notificationTopic);
  }

  private buildTopic(): Topic {
    const key = new Key(this, 'MonitoringKey', {
      description: 'KMS Key for SNS Topic Encryption',
      enableKeyRotation: true, // Enables automatic key rotation
    });

    const topic = new Topic(this, `${this.node.id}Alarms`, {
      displayName: `${this.node.id}alarms`,
      masterKey: key,
    });

    // Grant CloudWatch permissions to publish to the SNS topic
    topic.addToResourcePolicy(
      new PolicyStatement({
        actions: ['sns:Publish'],
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('cloudwatch.amazonaws.com')],
        resources: [topic.topicArn],
      })
    );

    new CfnOutput(this, constants.MONITORING_TOPIC, {
      value: topic.topicName,
    }).overrideLogicalId(constants.MONITORING_TOPIC);

    return topic;
  }

  private buildHighLevelDashboard(crudApi: RestApi, topic: Topic) {
    const alarmFactoryDefaults: AlarmFactoryDefaults = {
      actionsEnabled: true,
      alarmNamePrefix: this.node.id,
      action: new SnsAlarmActionStrategy({ onAlarmTopic: topic }),
    };

    const highLevelFacade = new MonitoringFacade(this, `${this.node.id}HighFacade`, {
      alarmFactoryDefaults,
    });

    highLevelFacade.addLargeHeader('Order REST API High Level Dashboard');

    highLevelFacade.monitorApiGateway({
      api: crudApi,
      add5XXFaultRateAlarm: {
        internalError: { maxErrorRate: 1},
      }
    });

    const metricFactory = highLevelFacade.createMetricFactory();
    const createMetric = metricFactory.createMetric(
      'ValidCreateOrderEvents', 
      MetricStatistic.N, 
      'create order events',
      { [constants.METRICS_DIMENSION_KEY]: constants.SERVICE_NAME },
      'blue',
      constants.METRICS_NAMESPACE,
      Duration.days(1),
    );
      
    const group: CustomMetricGroup = {
      metrics: [createMetric],
      title: 'Daily Order Requests',
    }
    highLevelFacade.monitorCustom({ metricGroups: [group], humanReadableName: 'Daily KPIs', alarmFriendlyName: 'KPIs' });
  }

  private buildLowLevelDashboard(db: Table, idempotencyTable: Table, functions: Function[], topic: Topic) {
    const alarmFactoryDefaults: AlarmFactoryDefaults = {
      actionsEnabled: true,
      alarmNamePrefix: this.node.id,
      action: new SnsAlarmActionStrategy({ onAlarmTopic: topic }),
    };

    const lowLevelFacade = new MonitoringFacade(this, `${this.node.id}LowFacade`, {
      alarmFactoryDefaults,
    });

    lowLevelFacade.addLargeHeader('Orders REST API Low Level Dashboard');

    for (const func of functions) {
      lowLevelFacade.monitorLambdaFunction({
        lambdaFunction: func,
        addLatencyP90Alarm: { p90: { maxLatency: Duration.seconds(3) } },
      });

      lowLevelFacade.monitorLog({
        logGroupName: func.logGroup.logGroupName, 
        humanReadableName: 'Error logs',
        pattern: 'ERROR',
        alarmFriendlyName: 'error logs',
      });
    }

    lowLevelFacade.monitorDynamoTable({table: db, billingMode: BillingMode.PAY_PER_REQUEST });
    lowLevelFacade.monitorDynamoTable({ table: idempotencyTable, billingMode: BillingMode.PAY_PER_REQUEST });
  }
}
