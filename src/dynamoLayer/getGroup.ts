import { DynamoDB } from "aws-sdk";
import { instance } from "../instance";
import { mapItemListToInstance } from "../mappers";
import { filterByTtl, getDynamoClient, dynamoConfiguration } from "../dynamoClient";

export const getGroup = async (group: string): Promise<instance[]> => {
  const dynamoClient = getDynamoClient();

  const params: DynamoDB.QueryInput = <DynamoDB.QueryInput> {
    TableName: <DynamoDB.TableName>dynamoConfiguration.tableName,
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

