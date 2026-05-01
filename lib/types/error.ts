export interface MongoErrorType extends Error {
    code?: number | string;
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
  }
  
export interface EmailErrorType extends Error {
    response?: string;
  }
