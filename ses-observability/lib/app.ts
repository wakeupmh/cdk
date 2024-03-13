import { Fn, Stack, StackProps } from 'aws-cdk-lib'
import { Alarm, Metric, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import {
  CloudWatchDimension,
  CloudWatchDimensionSource,
  ConfigurationSet,
  EmailSendingEvent,
  EventDestination,
} from 'aws-cdk-lib/aws-ses'
import { ITopic, Topic } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'

export class EmailDeliverability extends Stack {
  private context = 'email-deliverability'
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    this.registerEvent()
  }

  private createConfigurationSet(topic: ITopic): void {
    const configSet = new ConfigurationSet(this, `${this.context}-configuration-set`, {
      sendingEnabled: true,
      configurationSetName: this.context,
      reputationMetrics: true,
    })

    configSet.addEventDestination('sns', {
      destination: EventDestination.snsTopic(topic),
      enabled: true,
      events: [
        EmailSendingEvent.SEND,
        EmailSendingEvent.REJECT,
        EmailSendingEvent.BOUNCE,
        EmailSendingEvent.COMPLAINT,
        EmailSendingEvent.DELIVERY,
        EmailSendingEvent.OPEN,
        EmailSendingEvent.RENDERING_FAILURE,
        EmailSendingEvent.CLICK,
      ],
    })

    const cloudWatchDimensions: CloudWatchDimension[] = [
      {
        source: CloudWatchDimensionSource.MESSAGE_TAG,
        name: 'ses:from-domain',
        defaultValue: 'welbecare.com',
      },
    ]
    configSet.addEventDestination('cloudwatch', {
      destination: EventDestination.cloudWatchDimensions(cloudWatchDimensions),
      enabled: true,
      events: [
        EmailSendingEvent.SEND,
        EmailSendingEvent.REJECT,
        EmailSendingEvent.BOUNCE,
        EmailSendingEvent.COMPLAINT,
        EmailSendingEvent.DELIVERY,
        EmailSendingEvent.OPEN,
        EmailSendingEvent.RENDERING_FAILURE,
        EmailSendingEvent.CLICK,
      ],
    })
  }

  private createAlarms(alarmTopic: ITopic, eventsToAlarmWithThreshold: Array<Record<string, string | number>>): void {
    for (const eventToAlarm of eventsToAlarmWithThreshold) {
      const alarm = new Alarm(this, `ses-${eventToAlarm}-alarm`, {
        metric: new Metric({
          namespace: 'AWS/SES',
          metricName: eventToAlarm.event as string,
          statistic: 'Sum',
        }),
        threshold: eventToAlarm.threshold as number,
        evaluationPeriods: 5,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        actionsEnabled: true,
        alarmDescription: `SES Account ${eventToAlarm.event} Alarm`,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        alarmName: `ses-account-${eventToAlarm.event}-alarm`,
      })

      alarm.addAlarmAction(new SnsAction(alarmTopic))
    }
  }

  private registerEvent(): void {
    const emailDeliveryTopic = new Topic(this, `${this.context}-topic`, {
      topicName: `${this.context}-topic`,
      displayName: `${this.context}-topic`,
    })

    const slackTopic = Topic.fromTopicArn(
      this,
      `${this.context}-slack-notification-topic`,
      Fn.importValue('infrastructure::topic::slack::arn'),
    )

    this.createConfigurationSet(emailDeliveryTopic)
    this.createAlarms(slackTopic, [
      {
        event: EmailSendingEvent.REJECT,
        threshold: 1,
      },
      {
        event: EmailSendingEvent.BOUNCE,
        threshold: 5,
      },
      {
        event: EmailSendingEvent.COMPLAINT,
        threshold: 5,
      },
      {
        event: EmailSendingEvent.RENDERING_FAILURE,
        threshold: 1,
      },
    ])
  }
}
