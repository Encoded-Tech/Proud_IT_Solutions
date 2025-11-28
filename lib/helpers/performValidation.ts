import { VALIDATION } from "../constants";

export const sanitize = (str: string): string =>
    str
      .replace(/</g, "&lt;")  // HTML escaping
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;") 
      .replace(/'/g, "&#39;")
      .replace(/\s+/g, " ")    // Normalize white space
      .trim();
  
  export const isSuspiciousInput = (str: string): boolean => {
    const suspiciousPatterns = [
      /%[0-9a-f]{2}/i,       // URL encoding
      /\\x[0-9a-f]{2}/i,     // Hex escapes
      /javascript:/i,        // JS protocols
      /data:/i,              // Data URIs
      /eval\(/i,             // Eval calls
      /document\./i,         // DOM access
      /window\./i,           // Window access
      /<\s*(script|iframe)/i // HTML tags
    ];
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  export const isDisposableEmail = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return VALIDATION.EMAIL.BLOCKED_DOMAINS.some(blocked => {
      const blockedParts = blocked.split('.').reverse();
      const domainParts = domain.split('.').reverse();
      return blockedParts.every((part, i) => domainParts[i] === part);
    });
  };