import { DynamoDB } from "aws-sdk";
import { instance } from "./instance";
import { mapItemListToInstance } from "./mapItemListToInstance";
import { filterByTtl } from "./dynamoClient";

export const getGroup = async (group: string): Promise<instance[]> => {
  const { INSTANCES_TABLE, IS_OFFLINE } = process.env;
  const dynamoClient = IS_OFFLINE === 'true' ?
  new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  }) :
  new DynamoDB.DocumentClient();

  const params: DynamoDB.QueryInput = <DynamoDB.QueryInput> {
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
    const results = mapItemListToInstance(result.Items);
    
    return filterByTtl(results);
  }
  catch(error) {
    throw error;
  };
}