

export const PART_TYPES = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "storage",
  "psu",
  "case",
  "cooler",
  "monitor",
  "keyboard",
  "mouse",
  "ups",
  "fan",
  "headset",
  "thermalPaste",
  "captureCard",
  "rgbAccessory",
  "usbPort",
] as const;

export type PartType = typeof PART_TYPES[number];