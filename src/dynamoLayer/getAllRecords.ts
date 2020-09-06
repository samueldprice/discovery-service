import { DynamoDB } from "aws-sdk";
import { instance } from "../instance";
import { mapItemListToInstance } from "../mappers";
import { filterByTtl, getDynamoClient, dynamoConfiguration } from "../dynamoClient";

export const getAllRecords = async (): Promise<instance[]> => {
  const dynamoClient = getDynamoClient();

  const params: DynamoDB.ScanInput = {
    TableName: <DynamoDB.TableName>dynamoConfiguration.tableName,
  };

  try {
    const result = await dynamoClient.scan(params).promise();
    const results = mapItemListToInstance(result.Items);
    
    return filterByTtl(results);
  }
  catch(error) {
    throw error;
  };
}

