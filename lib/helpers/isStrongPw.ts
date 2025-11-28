export function isStrongPassword(pw: string) {
    if (!pw || pw.length < 8) return false;
  
    return /[a-z]/.test(pw)
      && /[A-Z]/.test(pw)
      && /[0-9]/.test(pw)
      && /[\W_]/.test(pw);
  }
  