import { NextRequest } from "next/server";

export function getRequestContext(req: NextRequest) {
  return {
    path: req.nextUrl.pathname,
    method: req.method,
    query: Object.fromEntries(req.nextUrl.searchParams),
    userAgent: req.headers.get('user-agent'),
  };
}
