export function calculateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 wpm
}
