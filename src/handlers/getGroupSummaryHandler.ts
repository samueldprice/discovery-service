import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Context } from 'vm';
import { groupSummary } from '../instance';
import { getAllRecords } from '../dynamoLayer';

export const get: APIGatewayProxyHandler = async (_: APIGatewayProxyEvent, _context: Context) => {

  try {
    const instances = await getAllRecords();
    const summary: groupSummary[] = instances.reduce((prev, current): groupSummary[] => {

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
