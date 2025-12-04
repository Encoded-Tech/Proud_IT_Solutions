import { withDB } from "@/lib/HOF";
import { withAuth } from "@/lib/HOF/withAuth";
import userModel from "@/models/userModel";
import { ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { AdminUser } from "../route";

export const GET = withAuth(
withDB(async(req, _context?) => {
    const params = await _context?.params;
    const id = params?.id;
    if (!id) {
        return NextResponse.json({
            success: false,
            message: "user id missing",
            status: 404
        })
    }
    const user = await userModel.findById(id);
    const hasUser = !!user;
    const response: ApiResponse<AdminUser> = {
        success: hasUser,
        message: hasUser ? "Single user Fetched Successfully" : "user not found",
        data: user,
        status: hasUser ? 200 : 400
    }
    return NextResponse.json(response, { status: response.status })
}, { resourceName: "user" }, 

), { roles: ["admin"] }
);
