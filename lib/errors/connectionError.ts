export function isTransientError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const transientKeywords = ["timeout", "connection", "network"];
    return transientKeywords.some(keyword => error.message.toLowerCase().includes(keyword));
  }