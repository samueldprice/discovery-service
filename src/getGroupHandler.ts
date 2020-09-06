import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import { DynamoDB } from 'aws-sdk';

export const get: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context) => {
  const { INSTANCES_TABLE, IS_OFFLINE } = process.env;
  const dynamoClient = IS_OFFLINE === 'true' ?
    new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    }) :
    new DynamoDB.DocumentClient();

  const group = event && event.pathParameters && event.pathParameters.group;

  const params: DynamoDB.QueryInput = <DynamoDB.QueryInput>{
    TableName: <DynamoDB.TableName>INSTANCES_TABLE,
    KeyConditionExpression: "#group = :group",
    ExpressionAttributeNames: {
      "#group" : "group"
    },
    ExpressionAttributeValues: {
      ":group": group
    }
  };

  try {
    const result = await dynamoClient.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  }
  catch(error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error,
          params,
          event,
          message: 'Error retrieving Instances'})
      };
  };
}
