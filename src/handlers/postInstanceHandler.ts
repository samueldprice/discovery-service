import 'source-map-support/register';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { Context } from 'vm';
import { instance } from '../instance';
import { ttlCalc } from '../dynamoClient';
import { getGroup } from '../dynamoLayer/getGroup';
import { mapInstanceToOutputDto } from '../mappers';
import { postInstance } from '../dynamoLayer';

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
  var ttl = ttlCalc(now);

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
    ttl: ttl,
  };

  try {
    await postInstance(instance);
    return {
      statusCode: 201,
      body: JSON.stringify(mapInstanceToOutputDto(instance))
    };
  }
  catch(error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error,
          message: 'Error saving instance',
        })
      };
  };
}
