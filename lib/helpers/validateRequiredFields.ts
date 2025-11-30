import { NextResponse } from "next/server";

export function checkRequiredFields(
  fields: Record<string, string | null | undefined | File | File[] | number> ,
  customMessage?: string
): NextResponse | null {
  const missingFields = Object.entries(fields)
    .filter(([, value]) => !value) 
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return NextResponse.json({
      success: false,
      message: customMessage || `You missed these fields: ${missingFields.join(", ")}`,
    }, { status: 400 });
  }

  return null;
}
