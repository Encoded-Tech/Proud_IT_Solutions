export const PART_TYPES = [
  "casing",
  "psu",
  "motherboard",
  "processor",
  "ram",
  "storage",
  "cpu_cooler",
  "gpu",
  "monitor",
  "keyboard",
  "mouse",
  "headset",
  "mousepad",
  "rgb_fan"
] as const;

export type PartType = typeof PART_TYPES[number];
