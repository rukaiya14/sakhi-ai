#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { SkillScanStack } = require('../lib/skillscan-stack');

const app = new cdk.App();

new SkillScanStack(app, 'SkillScanStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'SheBalance SkillScan AI with Llama 3 70B'
});

app.synth();
