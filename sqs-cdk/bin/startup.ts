#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib'

import 'source-map-support/register'
import { buildEnvironment } from '../config/utils/util'
import { DatabaseAuroraApp } from '../lib/database-aurora-app'

const app = new App()

const config = buildEnvironment()
Tags.of(app).add('service', config.variables.serviceName)
Tags.of(app).add('project', config.variables.projectName)

new DatabaseAuroraApp(app, config.variables.serviceName, {
  env: config.env,
  variables: config.variables,
})

app.synth()
