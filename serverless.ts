import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'discovery-service',
  },
  org: 'spricesoftware',
  app: 'discovery-service',
  frameworkVersion: '>=1.72.0',
  custom: {
    "serverless-offline": {
      useChildProcesses: true
    },
    tableName: 'instances-${self:provider.stage}',
    timeToLiveSeconds: 20,
    dynamodb: {
      start: {
        migrate: true,
      },
      stages: [
        'dev',
      ],
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-dynamodb-local',
    'serverless-offline',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
           'dynamodb:Query',
           'dynamodb:Scan',
           'dynamodb:GetItem',
           'dynamodb:PutItem',
           'dynamodb:UpdateItem',
           'dynamodb:DeleteItem',
        ],
        Resource: {
          "Fn::GetAtt": [ "InstancesDynamoDBTable", "Arn" ]
        }
      }
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      INSTANCES_TABLE: '${self:custom.tableName}',
      TTL_SECONDS: '${self:custom.timeToLiveSeconds}',
    },
  },
  functions: {
    getGroup: {
      handler: 'src/getGroupHandler.get',
      events: [
        {
          http: {
            method: 'get',
            path: 'groups/{group}',
          }
        }
      ]
    },
    getGroups: {
      handler: 'src/getGroupsHandler.get',
      events: [
        {
          http: {
            method: 'get',
            path: 'groups/',
          }
        }
      ]
    },
    postInstance: {
      handler: 'src/postInstanceHandler.post',
      events: [
        {
          http: {
            method: 'post',
            path: '/{group}/{id}',
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      InstancesDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'group',
              AttributeType: 'S',
            },
            {
              AttributeName: 'instanceId',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'group',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'instanceId',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput:{
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: '${self:custom.tableName}',

          // 
          TimeToLiveSpecification: {
            "AttributeName" : "ttl",
            "Enabled" : true
          }
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
