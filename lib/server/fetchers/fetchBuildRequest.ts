"use server";

import { connectDB } from "@/db";

import { requireUser } from "@/lib/auth/requireSession";
import { BuildRequest, IBuildRequest } from "@/models/buildMyPcModel";
import { mapBuildRequest, mapBuildRequestsArray } from "../mappers/MapBuildMyPc";
import { isValidObjectId } from "mongoose";

export async function fetchMyBuildRequests() {
  try {
    const user = await requireUser();
    await connectDB();

    const buildRequests = await BuildRequest
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean<IBuildRequest[]>();

    return {
      success: true,
      message: "Build requests fetched successfully",
      data: mapBuildRequestsArray(buildRequests),
    };
  } catch (error) {
    console.error("fetchMyBuildRequests error:", error);
    return {
      success: false,
      message: "Failed to fetch build requests",
      data: [],
    };
  }
}


export async function fetchBuildRequestById(id: string) {
 try {
   const user = await requireUser();
  if (!isValidObjectId(id)) {
  return { success: false, message: "Invalid build request id" };
}
 
   await connectDB();
   const buildRequest = await BuildRequest.findOne({
     _id: id,
     userId: user.id,
   }).lean<IBuildRequest>();
 
   if (!buildRequest) {
     return { success: false, message: "Build request not found" };
   }
 
   return {
     success: true,
     message: "Build request fetched successfully",
     data: mapBuildRequest(buildRequest),
   };
 } catch (error) {
  console.error("fetchBuildRequestById error:", error);
  return{
    success: false,
    message: "Failed to fetch build request",
      data: null,
  }
  
 }
}
