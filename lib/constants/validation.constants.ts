export const VALIDATION = {
  // Common error messages that can be reused across fields
  COMMON_ERRORS: {
    HTML: "HTML tags are not allowed",
    UNSAFE: "Potentially unsafe content detected",
    INVALID_CHARS: "Contains invalid characters",
    SUSPICIOUS: "Invalid input pattern detected"
  },

  NAME: {
    REGEX: /^[\p{L}\p{M}' .-]{2,50}$/u,
    MIN: 2,
    MAX: 50,
    ERROR: "Name must be between 2 and 50 characters. Allowed characters: letters, accents, apostrophes, spaces, periods, and hyphens.",
    ERROR_MESSAGES: {
      HTML: "HTML tags are not allowed in name field",
      UNSAFE: "Potentially unsafe content detected in name field",
      CHARS: "Name contains invalid characters"
    }
  },

  EMAIL: {
    MAX_LENGTH: 100,
    REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    BLOCKED_DOMAINS: [
      "tempmail.com", "10minutemail.com", "mailinator.com", 
      "fakeemail.com", "example.com", "test.com"
    ],
    ERROR: "Please enter a valid email address. Disposable email addresses are not allowed.",
    ERROR_MESSAGES: {
      HTML: "HTML tags are not allowed in email field",
      UNSAFE: "Potentially unsafe content detected in email field",
      CHARS: "Email contains invalid characters",
      DISPOSABLE: "Disposable email domains are not allowed"
    }
  },

  PHONE: {
    MIN: 7,
    MAX: 15,
    CLEAN_REGEX: /[^\d]/g,
    FORMAT_REGEX: /^(\+?977[-\s]?)?(98\d{8}|97\d{8})$|^(\+?\d{1,4}[-\s]?)?(\(?\d{1,4}\)?[-\s]?)?\d{7,15}$/,   
    ERROR: "Phone number must be between 7 and 15 digits and follow the correct format. Nepali numbers should be 10 digits.",
    ERROR_MESSAGES: {
      HTML: "HTML tags are not allowed in phone field",
      UNSAFE: "Potentially unsafe content detected in phone field",
      CHARS: "Phone number contains invalid characters",
      FORMAT: "Invalid phone number format"
    }
  },

  DESCRIPTION: {
    MIN: 10,
    MAX: 2000,
    ALLOWED_CHARS: /^[\p{L}\p{M}\p{N}\p{Sc}\p{Sm}\p{Sk}\p{So}!'()*+,\-./:;=?@[\]^_`{|}~ \r\n\t]*$/u,
    ERROR: "Description must be between 10 and 2000 characters",
    ERROR_MESSAGES: {
      HTML: "HTML tags are not allowed in description",
      UNSAFE: "The description contains unsafe or potentially harmful content",
      CHARS: "The description contains unsupported characters. Please avoid special symbols that aren't allowed"
    }
  },

  ORGANIZATION: {
    MIN: 0,
    MAX: 100,
    REGEX: /^[a-zA-Z0-9\s\-_.&',()]+$/,
    ERROR: "Organization name can only contain letters, numbers, spaces, and common punctuation marks",
    ERROR_MESSAGES: {
      HTML: "HTML tags are not allowed in organization name",
      UNSAFE: "Potentially unsafe content detected in organization name",
      CHARS: "Organization name contains invalid characters"
    }
  }
} as const;