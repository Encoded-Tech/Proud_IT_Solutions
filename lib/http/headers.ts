export const httpHeaders = (correlationId: string): Headers => {
    return new Headers({
      "X-Correlation-ID": correlationId,
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none';",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "geolocation=(), microphone=()",
    });
  };
  