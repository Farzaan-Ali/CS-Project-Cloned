//interfaces for the SDK 

export interface ToolMetadata {
  version?: string;
  db_status?: string;
  tier?: string;
  auth_level?: string;
  [key: string]: any; //allow for the "modifiable" part of metadata
}

export interface Tool {
  id: number;
  name: string;
  status: string;
  last_updated: string;
  metadata: ToolMetadata;
}