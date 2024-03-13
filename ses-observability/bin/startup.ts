#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib'

import 'source-map-support/register'
import { buildEnvironment } from '../config/utils/util'
import { EmailDeliverability } from '../lib/app'


const app = new App()

const config = buildEnvironment()
Tags.of(app).add('service', config.variables.serviceName)
Tags.of(app).add('project', config.variables.projectName)

new EmailDeliverability(app, 'EmailDeliverabilityStack', {
  env: config.env,
  tags: {
    service: config.variables.serviceName,
    project: config.variables.projectName,
  },
})
  

app.synth()
