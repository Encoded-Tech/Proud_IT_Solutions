import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; 
import {  httpHeaders } from "../http"; 
import { isTransientError, classifyError } from "../errors";
import { log } from "../logger";
import { WithDBOptions } from "../types";



/**
 * Error handler for Next.js API routes
 * Features:
 * - Error classification
 * - Retry logic for transient errors
 * - Correlation ID tracking
 * - Structured error responses
 * - Debug information in non-production environments
 * 
 * @param fn - The route handler function
 * @param options - Configuration options
 * @returns A wrapped function with error handling
 */
const errorHandler = <
  Args extends [NextRequest] | [NextRequest, { params: Record<string, string | string[]> }],
  Result extends NextResponse | Response | Record<string, object>

>(
  fn: (...args: Args) => Promise<Result>,
  options: WithDBOptions = {}
): ((...args: Args) => Promise<Result | NextResponse | Response>) => {
  
  const {
    maxRetries = 2,
    retryDelay = 300,
    includeDebugInfo = process.env.NODE_ENV !== "production"
  } = options;

  return async (...args: Args) => {
    // Extract correlationId from the incoming request headers if nothing came along then we will create a new uuid
    const req = args[0];
    const correlationId = req.headers.get('X-Correlation-ID') || uuidv4(); 
    
    const responseHeaders = httpHeaders(correlationId); 
    let retries = 0;

    const tryExecute = async () => {
      try {
        const response = await fn(...args);
        
        if (response instanceof Response) {
          response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
          });

          if (response instanceof NextResponse) {
            return new NextResponse(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders
            });
          } else {
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders
            });
          }
        }
        
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isTransientError(error) && retries < maxRetries) {
          retries++;
          log.warn(`Transient error, retrying ${retries}/${maxRetries}`, {
            correlationId,
            error: error.message
          });
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, retries - 1))
          );

          return tryExecute();
        }

        log.error("Request failed", {
          correlationId,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        });
        const { statusCode, friendlyMessage, errorCode } = classifyError(error, options.resourceName);
        
        if (statusCode === 429) {
          responseHeaders.set("X-Retry-Attempt", retries.toString());
          responseHeaders.set("Retry-After", "60");
        }
        const errorBody = {
          success: false,
          error: friendlyMessage,
          code: errorCode,
          correlationId,
          ...(includeDebugInfo && {
            debug: {
              stack: error.stack,
              original: error.message
            }
          })
        };

        return NextResponse.json(errorBody, {
          status: statusCode,
          headers: responseHeaders
        });
      }
    };

    return tryExecute();
  };
};

export default errorHandler;
