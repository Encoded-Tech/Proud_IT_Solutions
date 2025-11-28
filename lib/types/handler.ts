import { NextRequest, NextResponse } from "next/server";

export type ContextWithParams = { params: Record<string, string | string[]> };



export type RouteHandler<Req extends NextRequest = NextRequest> = (
  req: Req,
  context?: ContextWithParams | undefined
) => Promise<NextResponse>;

export type WithDBOptions = {
  maxRetries?: number;
  retryDelay?: number;
  includeDebugInfo?: boolean;
  resourceName?: string;
};