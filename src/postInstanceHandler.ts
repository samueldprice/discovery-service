import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import { DynamoDB } from 'aws-sdk';
import { instance } from './instance';

export const post: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context) => {
  const { INSTANCES_TABLE, IS_OFFLINE } = process.env;
  const dynamoClient = IS_OFFLINE === 'true' ?
    new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    }) :
    new DynamoDB.DocumentClient();

  const request: instance = JSON.parse(event.body || '');
  const id = event && event.pathParameters && event.pathParameters.id;
  const group = event && event.pathParameters && event.pathParameters.group;

  // The typescript definitions for PutItemInput dont seem correct so have to fudge it
  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>{
    TableName: <DynamoDB.TableName>INSTANCES_TABLE,
    Item: {
      instanceId: id,
      group: group,
      meta: request.meta
    },
  };

  var result = {};
  try {

    result = await dynamoClient.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        id,
        group,
        createdAt: 'todo',
        updatedAt: 'todo',
        meta: request.meta,
      })
    };
  }
  catch(error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error,
          result,
          params,
          message: 'Error saving instance',
        })
      };
  };
}
