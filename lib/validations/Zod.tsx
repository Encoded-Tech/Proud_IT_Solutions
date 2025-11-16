import { z } from "zod";
import { isDisposableEmail, isSuspiciousInput, sanitize } from "../helpers/performValidation";
import { VALIDATION } from "../constants/validation.constants";

export const contactSchema = z.object({
  name: z.preprocess(
    val => sanitize(String(val ?? "").trim()),
    z.string()
      .min(VALIDATION.NAME.MIN, `Minimum ${VALIDATION.NAME.MIN} characters`)
      .max(VALIDATION.NAME.MAX, `Maximum ${VALIDATION.NAME.MAX} characters`)
      .regex(VALIDATION.NAME.REGEX, VALIDATION.NAME.ERROR)
      .refine(val => !/[<>]/.test(val), VALIDATION.NAME.ERROR_MESSAGES.HTML)
      .refine(val => !/script|iframe|on\w+=|javascript:/i.test(val), VALIDATION.NAME.ERROR_MESSAGES.UNSAFE)
      .refine(val => !isSuspiciousInput(val), {

        message: VALIDATION.COMMON_ERRORS.SUSPICIOUS,
        path: ["name"]
      })
  ),

  
  email: z.preprocess(
    val => sanitize(String(val ?? "").toLowerCase().trim()),
    z.string()
      .email("Invalid email address")
      .max(VALIDATION.EMAIL.MAX_LENGTH)
      .refine(val => !/[<>]/.test(val), VALIDATION.EMAIL.ERROR_MESSAGES.HTML)
      .refine(val => !/script|iframe|on\w+=|javascript:/i.test(val), VALIDATION.EMAIL.ERROR_MESSAGES.UNSAFE)
      .refine(email => !isDisposableEmail(email), {
        message: VALIDATION.EMAIL.ERROR_MESSAGES.DISPOSABLE,
        path: ["email"]
      })
      .refine(val => !isSuspiciousInput(val), {
        message: VALIDATION.COMMON_ERRORS.SUSPICIOUS,
        path: ["email"]
      })
  ),
  
  phone: z.preprocess(
    val => String(val ?? "").replace(VALIDATION.PHONE.CLEAN_REGEX, ""),
    z.string()
      .min(VALIDATION.PHONE.MIN, `Minimum ${VALIDATION.PHONE.MIN} digits required`)
      .max(VALIDATION.PHONE.MAX, `Maximum ${VALIDATION.PHONE.MAX} digits allowed`)
      .regex(VALIDATION.PHONE.FORMAT_REGEX, VALIDATION.PHONE.ERROR_MESSAGES.FORMAT)
      .refine(val => !/[<>]/.test(val), VALIDATION.PHONE.ERROR_MESSAGES.HTML)
      .refine(val => !/script|iframe|on\w+=|javascript:/i.test(val), VALIDATION.PHONE.ERROR_MESSAGES.UNSAFE)
      .refine(val => !isSuspiciousInput(val), {
        message: VALIDATION.COMMON_ERRORS.SUSPICIOUS,
        path: ["phone"]
      })
      .refine(val => {
        const isNepali = /^(\+?977)?(98|97)\d{8}$/.test(val);
        return !isNepali || val.length === 10 || val.length === 13; 
      }, {
        message: "Nepali phone numbers must be 10 digits",
        path: ["phone"]
      })
      
  ),
  
  description: z.preprocess(
    val => sanitize(String(val ?? "").trim()),
    z.string()
      .min(VALIDATION.DESCRIPTION.MIN, `Minimum ${VALIDATION.DESCRIPTION.MIN} characters`)
      .max(VALIDATION.DESCRIPTION.MAX, `Maximum ${VALIDATION.DESCRIPTION.MAX} characters`)
      .refine(val => !/[<>]/.test(val), VALIDATION.DESCRIPTION.ERROR_MESSAGES.HTML)
      .refine(val => !/script|iframe|on\w+=|javascript:/i.test(val), VALIDATION.DESCRIPTION.ERROR_MESSAGES.UNSAFE)
      .refine(val => VALIDATION.DESCRIPTION.ALLOWED_CHARS.test(val), VALIDATION.DESCRIPTION.ERROR_MESSAGES.CHARS)
      .refine(val => !isSuspiciousInput(val), {
        message: VALIDATION.COMMON_ERRORS.SUSPICIOUS,
        path: ["description"]
      })
  ),
  
  organization: z.preprocess(
    val => val ? sanitize(String(val).trim()) : undefined,
    z.string()
      .min(VALIDATION.ORGANIZATION.MIN, `Minimum ${VALIDATION.ORGANIZATION.MIN} characters`)
      .max(VALIDATION.ORGANIZATION.MAX, `Maximum ${VALIDATION.ORGANIZATION.MAX} characters`)
      .regex(VALIDATION.ORGANIZATION.REGEX, VALIDATION.ORGANIZATION.ERROR)
      .refine(val => !val || !/[<>]/.test(val), VALIDATION.ORGANIZATION.ERROR_MESSAGES.HTML)
      .refine(val => !val || !/script|iframe|on\w+=|javascript:/i.test(val), VALIDATION.ORGANIZATION.ERROR_MESSAGES.UNSAFE)
      .refine(val => !val || !isSuspiciousInput(val), {
        message: VALIDATION.COMMON_ERRORS.SUSPICIOUS,
        path: ["organization"]
      })
      .optional()
  ),
  
  preferredContact: z.enum(["email", "phone"])
    .optional()
    .default("email"),
  
  robotCheck: z.string()
    .max(0, "Invalid submission detected")
    .optional()
    .default(""),
}).refine(data => {
  // Cross-field validation example:
  // If preferredContact is phone, phone must be valid
  if (data.preferredContact === "phone") {
    return data.phone.length >= VALIDATION.PHONE.MIN;
  }
  return true;
}, {
  message: "Phone number must be provided when selecting phone contact",
  path: ["phone"]
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const validateContactForm = (data: unknown): {
  success: boolean;
  data?: ContactFormData;
  errors?: z.ZodFormattedError<ContactFormData>;
} => {
  const result = contactSchema.safeParse(data);
  return result.success
     ? { success: true, data: result.data }
    : { success: false, errors: result.error.format() };
};