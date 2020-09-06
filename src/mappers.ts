import { instance } from "./instance";
import { ItemList } from "aws-sdk/clients/dynamodb";
import { AttributeMap } from "aws-sdk/clients/dynamodbstreams";

export const mapItemListToInstance = (items?: ItemList): instance[] => {
  return items?.map((i: AttributeMap) => <instance> {
    instanceId: i.instanceId,
    group: i.group,    
    meta: i.meta,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
    ttl: i.ttl,
  }) || [];
};

export const mapInstanceToOutputDto = (item: instance) => {
    delete item.ttl;
    return item;
};