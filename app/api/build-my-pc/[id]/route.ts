import { getAuthUserId } from "@/lib/auth/getAuthUser";
import { checkRequiredFields } from "@/lib/helpers/validateRequiredFields";
import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import { BuildRequest } from "@/models/buildMyPcModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

export const GET = withAuth(

    withDB(async (req, _context?) => {
        const params = await _context?.params;
        const id = params?.id;

        const userId = getAuthUserId(req);
        const user = await userModel.findById(userId)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found for this user ${userId} `,
            }, { status: 404 })
        }

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "No id provided",
            }, { status: 400 })
        }

        const singleBuildRequest = await BuildRequest.findById({ _id: id, userId })

        if (!singleBuildRequest) {
            return NextResponse.json({
                success: false,
                message: `No build request found for this user ${user.name}`,
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: `Build request fetched successfully for user ${user.name}`,
            data: singleBuildRequest
        }, { status: 200 })
    }, { resourceName: "build-my-pc" }),
    { roles: ["admin", "user"] }
)

export const PUT = withAuth(
    withDB(async (req, _context?) => {
        const params = await _context?.params;
        const id = params?.id;

        const userId = getAuthUserId(req);
        const user = await userModel.findById(userId)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found for this user ${userId} `,
            }, { status: 404 })
        }

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "No id provided",
            }, { status: 400 })
        }

        const body = await req.json();

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

        const updatedBuildRequest = await BuildRequest.findById({ _id: id, userId })
            .populate("userId", "name phone")
            .sort({ createdAt: -1 })

        if (!updatedBuildRequest) {
            return NextResponse.json({
                success: false,
                message: `No build request found for this user ${user.name}`,
            }, { status: 404 })
        }

        if (name) updatedBuildRequest.name = name;
        if (phone) updatedBuildRequest.phone = phone;
        if (email) updatedBuildRequest.email = email;
        if (budgetNPR) updatedBuildRequest.budgetNPR = budgetNPR;
        if (uses) updatedBuildRequest.uses = uses;
        if (targetResolution) updatedBuildRequest.targetResolution = targetResolution;
        if (targetFPS) updatedBuildRequest.targetFPS = targetFPS;
        if (cpuPreference) updatedBuildRequest.cpuPreference = cpuPreference;
        if (cpuModel) updatedBuildRequest.cpuModel = cpuModel;
        if (gpuPreference) updatedBuildRequest.gpuPreference = gpuPreference;
        if (gpuModel) updatedBuildRequest.gpuModel = gpuModel;
        if (ramGB) updatedBuildRequest.ramGB = ramGB;
        if (ramType) updatedBuildRequest.ramType = ramType;
        if (osPreference) updatedBuildRequest.osPreference = osPreference;
        if (rgbPreference) updatedBuildRequest.rgbPreference = rgbPreference;
        if (smallFormFactor) updatedBuildRequest.smallFormFactor = smallFormFactor;
        if (storage) updatedBuildRequest.storage = storage;
        if (peripherals) updatedBuildRequest.peripherals = peripherals;
        await updatedBuildRequest.save();

        return NextResponse.json({
            success: true,
            message: `Build request updated successfully for user ${user.name}`,
            data: updatedBuildRequest
        }, { status: 200 })
    }, { resourceName: "build-my-pc" }),
    { roles: ["user"] }
)

export const DELETE = withAuth(
    withDB(async (req, _context?) => {
        const params = await _context?.params;
        const id = params?.id;

        const userId = getAuthUserId(req);
        const user = await userModel.findById(userId)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found for this user ${userId} `,
            }, { status: 404 })
        }

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "No id provided",
            }, { status: 400 })
        }

        const singleBuildRequest = await BuildRequest.findById({ _id: id, userId })

        if (!singleBuildRequest) {
            return NextResponse.json({
                success: false,
                message: `No build request found for this user ${user.name}`,
            }, { status: 404 })
        }

        await singleBuildRequest.deleteOne();

        return NextResponse.json({
            success: true,
            message: `Build request deleted successfully for user ${user.name}`,
            data: singleBuildRequest
        }, { status: 200 })
    }, { resourceName: "build-my-pc" }),
    { roles: ["user"] }
)
