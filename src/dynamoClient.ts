import { DynamoDB } from "aws-sdk";
import { instance } from "./instance";

export const dynamoConfiguration = {
  tableName: process.env.INSTANCES_TABLE,
  isOffline: process.env.IS_OFFLINE,
  ttlSeconds: process.env.TTL_SECONDS,
};

export const getDynamoClient = (): DynamoDB.DocumentClient => {
  const dynamoClient = dynamoConfiguration.isOffline === 'true' ?
    new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    }) :
    new DynamoDB.DocumentClient();

    return dynamoClient;
};

export const ttlCalc = (now: number): number => {
  if (!dynamoConfiguration.ttlSeconds) {
    throw "configuration error. Please configure time to live";
  }
  return Math.round((now / 1000) + Number(dynamoConfiguration.ttlSeconds));
}

export const filterByTtl = (unfiltered: instance[]): instance[] => {
    // need to prefilter for ttl as dynamo doesnt delete immediately
    const nowSeconds = Math.round(new Date().getTime() / 1000);
    const filtered = unfiltered.filter(i => i.ttl >= nowSeconds);
    return filtered;
}
