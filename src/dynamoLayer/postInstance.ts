import { DynamoDB } from "aws-sdk";
import { getDynamoClient, dynamoConfiguration } from "../dynamoClient";
import { instance } from '../instance';

export const postInstance = async (instance: instance): Promise<boolean> => {
  const dynamoClient = getDynamoClient();

  // The typescript definitions for PutItemInput dont seem correct so have to fudge it
  const params: DynamoDB.PutItemInput = <DynamoDB.PutItemInput>{
    TableName: <DynamoDB.TableName>dynamoConfiguration.tableName,
    Item: <any>instance,
  };


  try {
    await dynamoClient.put(params).promise();
    
    return true;
  }
  catch(error) {
    throw error;
  };
}
