import { NextRequest, NextResponse } from "next/server";

export type ContextWithParams = { params: Record<string, string | string[]> };

export type RouteHandler =
  | ((req: NextRequest) => Promise<NextResponse>)
  | ((req: NextRequest, context: ContextWithParams) => Promise<NextResponse>);

export type WithDBOptions = {
  maxRetries?: number;
  retryDelay?: number;
  includeDebugInfo?: boolean;
};