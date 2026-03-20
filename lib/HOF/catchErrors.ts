import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; 
import { httpHeaders } from "../http"; 
import { isTransientError, classifyError } from "../errors";
import { log } from "../logger";
import { WithDBOptions, RouteHandler, ContextWithParams } from "../types";

const errorHandler = (
  fn: RouteHandler,
  options: WithDBOptions = {}
): RouteHandler => {

  const {
    maxRetries = 2,
    retryDelay = 300,
    includeDebugInfo = process.env.NODE_ENV !== "production"
  } = options;

  return async (req: NextRequest, context?: ContextWithParams) => {
    const correlationId = req.headers.get('X-Correlation-ID') || uuidv4(); 
    const responseHeaders = httpHeaders(correlationId); 
    let retries = 0;

    const tryExecute = async (): Promise<NextResponse> => {
      try {
        const response = await fn(req, context);

        if (response instanceof Response) {
          response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
          });

          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
          });
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

        const { statusCode, friendlyMessage, errorCode } =
          classifyError(error, options.resourceName);

        if (statusCode === 429) {
          responseHeaders.set("X-Retry-Attempt", retries.toString());
          responseHeaders.set("Retry-After", "60");
        }

        return NextResponse.json({
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
        }, {
          status: statusCode,
          headers: responseHeaders
        });
      }
    };

    return tryExecute();
  };
};

export default errorHandler;