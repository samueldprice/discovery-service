import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Context } from 'vm';
import { getGroup } from '../dynamoLayer/getGroup';
import { filterByTtl } from '../dynamoClient';
import { mapInstanceToOutputDto } from '../mappers';

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
    const mapped = filterByTtl(results).map(mapInstanceToOutputDto);

    return {
      statusCode: 200,
      body: JSON.stringify(mapped)
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
