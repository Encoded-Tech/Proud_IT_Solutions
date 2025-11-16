import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/db";
import errorHandler from "./catchErrors" 
import { ContextWithParams, RouteHandler, WithDBOptions } from "../types";

export function withDB( handler: RouteHandler, options: WithDBOptions = {}): RouteHandler {
  const wrapped = async ( req: NextRequest,context?: ContextWithParams): Promise<NextResponse> => {
    await connectDB();
    if (context) {
      return (handler as (req: NextRequest, context: ContextWithParams) => Promise<NextResponse>)(req, context);
    } else {
      return (handler as (req: NextRequest) => Promise<NextResponse>)(req);
    }
  };  
  return errorHandler(wrapped, options) as RouteHandler;
}
