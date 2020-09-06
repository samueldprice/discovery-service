import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import { DynamoDB } from 'aws-sdk';

export const get: APIGatewayProxyHandler = async (_: APIGatewayProxyEvent, _context: Context) => {
  const { INSTANCES_TABLE, IS_OFFLINE } = process.env;
  const dynamoClient = IS_OFFLINE === 'true' ?
    new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    }) :
    new DynamoDB.DocumentClient();

  const params: DynamoDB.ScanInput = {
    TableName: <DynamoDB.TableName>INSTANCES_TABLE,
  };

  try {
    const result = await dynamoClient.scan(params).promise();
    const { Items: instances } = result;
    return {
      statusCode: 200,
      body: JSON.stringify(instances)
    };
  }
  catch(error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error,
          message: 'Error retrieving Instances'})
      };
  };
}
