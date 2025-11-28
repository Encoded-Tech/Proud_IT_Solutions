import { isTransientError } from "../errors";
import { log } from "../logger";

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: { maxRetries: number; retryDelay: number },
  correlationId: string
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: unknown) {
      const safeError = error instanceof Error ? error : new Error(String(error));

      if (isTransientError(safeError) && retries < options.maxRetries) {
        retries++;
        const delay = options.retryDelay * Math.pow(2, retries - 1);
        log.warn(`Transient error detected, retrying (${retries}/${options.maxRetries})`, {
          correlationId,
          error: safeError.message,
        });
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw safeError;
      }
    }
  }
}
