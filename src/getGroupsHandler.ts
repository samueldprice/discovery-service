import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Context } from 'vm';
import { DynamoDB } from 'aws-sdk';
import { mapItemListToInstance } from './mappers';
import { groupSummary } from './instance';
import { filterByTtl } from './dynamoClient';

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
    const instances = await dynamoClient.scan(params).promise();
    const summary: groupSummary[] = 
      filterByTtl(mapItemListToInstance(instances.Items))
      .reduce((prev, current): groupSummary[] => {

        const existing = prev.find(summary => summary.group === current.group);

        if (existing) {
          existing.instances += 1;
          existing.createdAt = Math.min(existing.createdAt, current.createdAt);
          existing.lastUpdatedAt = Math.max(existing.lastUpdatedAt, current.updatedAt);
        } else {
          prev.push(<groupSummary>{
            createdAt: current.createdAt,
            group: current.group,
            instances: 1,
            lastUpdatedAt: current.updatedAt,
          });
        }

        return prev;
    }, new Array<groupSummary>());

    return {
      statusCode: 200,
      body: JSON.stringify(summary)
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
