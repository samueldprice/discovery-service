import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import { DynamoDB } from 'aws-sdk';
import { instance } from './instance';
import { dynamoConfiguration, getDynamoClient, ttlCalc } from './dynamoClient';
import { getGroup } from './getGroup';
// import { PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';

export const post: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context) => {

  const request: instance = JSON.parse(event.body || '');
  const instanceId = event?.pathParameters?.id;
  const group = event?.pathParameters?.group;

  if (!group || !instanceId) {
    return {
      statusCode: 400,
      body: 'invalid group or id'
    };
  }
  
  var now = new Date().getTime()
  var createdAt = now;

  try {
    const existingInstances = await getGroup(group);
    createdAt = existingInstances.find(i => i.instanceId === instanceId)?.createdAt ?? createdAt;
  } catch(error) {
    return {
      statusCode: 500,
      body: 'Unable to access dynamoDB',
    };
  }

  const instance: instance = {
    createdAt,
    instanceId,
    updatedAt: now,
    group: group,
    meta: request.meta,
    ttl: ttlCalc(now),
  };
console.log(instance);
  // The typescript definitions for PutItemInput dont seem correct so have to fudge it
  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>{
    TableName: <DynamoDB.TableName>dynamoConfiguration.tableName,
    Item: <any>instance,
  };

  var result = {};
  try {
    const dynamoClient = getDynamoClient();
    result = await dynamoClient.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(instance)
    };
  }
  catch(error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error,
          result,
          params,
          message: 'Error saving instance',
        })
      };
  };
}
