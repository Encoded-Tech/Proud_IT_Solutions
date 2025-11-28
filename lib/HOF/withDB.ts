import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db";
import errorHandler from "./catchErrors";
import { ContextWithParams, RouteHandler, WithDBOptions } from "../types";

export interface NextRequestWithResourceName extends NextRequest{
  resourceName?: string;
}

export function withDB(
  handler: RouteHandler,
  options: WithDBOptions = {}
): RouteHandler {

  const wrapped = async (
    req: NextRequestWithResourceName,
    context?: ContextWithParams
  ): Promise<NextResponse> => {
    // 1️⃣ Connect to database
    await connectDB();

    // 2️⃣ Attach resourceName to request if provided
    if (options.resourceName) {
      (req).resourceName = options.resourceName;
    }

    // 3️⃣ Call the original handler
    if (context) {
      return (handler as (req: NextRequest, context: ContextWithParams) => Promise<NextResponse>)(req, context);
    } else {
      return (handler as (req: NextRequest) => Promise<NextResponse>)(req);
    }
  };

  // 4️⃣ Wrap in error handler to catch all errors (Mongo, Mongoose, Email, etc.)
  return errorHandler(wrapped, options) as RouteHandler;
}
