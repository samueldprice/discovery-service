import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import 'source-map-support/register';
import { Context } from 'vm';
import { getGroup } from './getGroup';
import { filterByTtl } from './dynamoClient';

export const get: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context) => {

  const group = event?.pathParameters?.group;

  if (!group){
    return {
      statusCode: 400,
      body: 'invalid group'
    };
  }
  
  try {
    const results = await getGroup(group);
    return {
      statusCode: 200,
      body: JSON.stringify(filterByTtl(results))
    };
  }
  catch(error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error,
          event,
          message: 'Error retrieving Instances'})
      };
  };
}
