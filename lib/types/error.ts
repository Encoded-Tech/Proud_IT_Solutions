export interface MongoErrorType extends Error {
    code?: number | string;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  }
  
export interface NodemailerErrorType extends Error {
    response?: string;
  }