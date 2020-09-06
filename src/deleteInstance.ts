import { DynamoDB } from "aws-sdk";
import {getDynamoClient, dynamoConfiguration } from "./dynamoClient";

export const deleteInstance = async (group: string, instanceId: string): Promise<boolean> => {
  const dynamoClient = getDynamoClient();

  const params: DynamoDB.DeleteItemInput = <DynamoDB.DeleteItemInput> {
    TableName: <DynamoDB.TableName>dynamoConfiguration.tableName,
    Key: {
      "group": group,
      "instanceId": instanceId
    },
    // ConditionExpression: "group = :group && instanceId = :instanceId",
    // // ExpressionAttributeNames: {
    // //   "#group" : "group"
    // // },
    // ExpressionAttributeValues: {
    //   ":group": group,
    //   ":instanceId": instanceId,
    // }
  };

  try {
    await dynamoClient.delete(params).promise();
    
    return true;
  }
  catch(error) {
    throw error;
  };
}
