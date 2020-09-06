import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Context } from 'vm';
import { deleteInstance } from '../dynamoLayer/deleteInstance';

export const unregister: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context: Context) => {

  const group = event?.pathParameters?.group;
  const instanceId = event?.pathParameters?.id;

  if (!group || !instanceId) {
    return {
      statusCode: 400,
      body: 'invalid group or id'
    };
  }
  
  try {
    await deleteInstance(group, instanceId);

    return {
      statusCode: 204,
      body: '',
    };
  }
  catch(error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error,
          event,
          message: 'Error unregistering instance'})
      };
  };
}
