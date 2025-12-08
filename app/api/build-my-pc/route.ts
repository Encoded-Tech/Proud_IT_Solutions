import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { BuildRequest } from "@/models/buildMyPcModel";
import userModel from "@/models/userModel";

import { NextResponse } from "next/server";


export const GET = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    withDB(async (req, context?) => {

        const userId = getAuthUserId(req)

        const user = await userModel.findById(userId)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found for this user ${userId} `,
            }, { status: 404 })
        }
        const buildRequests = await BuildRequest.find({ userId }).sort({ createdAt: -1 })

        if (buildRequests.length === 0) {
            return NextResponse.json({
                success: false,
                message: `No build requests found for this user ${user.name} `,
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: `Build requests fetched successfully for user ${user.name}`,
            data: buildRequests
        }, { status: 200 })

    },
        { resourceName: "build-my-pc" }),
    { roles: ["admin", "user"] }
)

export const POST = withAuth(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withDB(async (req, context?) => {

    const userId = getAuthUserId(req)

    const user = await userModel.findById(userId)

    if (!user) {
      return NextResponse.json({
        success: false,
        message: `No user found for this user ${userId} `,
      }, { status: 404 })
    }
    const body = await req.json();

    // Destructure body
 const {
      name,
      phone,
      email,
      budgetNPR,
      uses,
      targetResolution,
      targetFPS,
      cpuPreference,
      cpuModel,
      gpuPreference,
      gpuModel,
      ramGB,
      ramType,
      osPreference,
      rgbPreference,
      smallFormFactor,
      storage,
      peripherals,
    } = body;

     const requiredFields = { name, phone, budgetNPR, uses };
        const missingFields = checkRequiredFields(requiredFields);
        if (missingFields) return missingFields;

    // Create new build request
     const newBuildRequest = await BuildRequest.create({
      userId,
      name,
      phone,
      email,
      budgetNPR,
      uses,
      targetResolution,
      targetFPS,
      cpuPreference,
      cpuModel,
      gpuPreference,
      gpuModel,
      ramGB,
      ramType,
      osPreference,
      rgbPreference,
      smallFormFactor,
      storage,
      peripherals,
    });
 

    return NextResponse.json(
      {
        success: true,
        message: `Build request submitted successfully for user ${user.name}`,
        data: newBuildRequest,
      },
      { status: 201 }
    );
  }, { resourceName: "build-my-pc" }),
  { roles: ["user"] } 
);