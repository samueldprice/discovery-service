export interface instance {
    instanceId: string,
    group: string,    
    meta: string,
    createdAt: number,
    updatedAt: number,
    ttl: number,
}

export interface groupSummary {
  group: string,
  instances: number,
  createdAt: number,
  lastUpdatedAt: number,
}