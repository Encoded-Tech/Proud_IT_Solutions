export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    status?: number;
}

type SecurityPrimitive = string | number | boolean | null;


type AdditionalFields = Record<string, SecurityPrimitive>;

interface LoginFailedNoUser {
    email: string;
    ip: string;
  }
  
  interface PasswordMismatch {
    email: string;
    ip: string;
    attempts: number;
  }
  
  interface SuspiciousLogin {
    email: string;
    ip: string;
    isNewIP: boolean;
    isNewDevice: boolean;
    userAgent: string;
  }

export type SecurityLogData =
  | LoginFailedNoUser
  | PasswordMismatch
  | SuspiciousLogin
  | AdditionalFields;

  
