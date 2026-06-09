export const CCTV_PART_TYPES = [
  "camera",
  "nvr",
  "poe_switch",
  "hdd_storage",
  "cat6_rj45_wire",
  "networking_box",
  "monitor",
  "junction_box",
  "installation_service",
  "accessories",
] as const;

export type CctvPartType = (typeof CCTV_PART_TYPES)[number];

export const CCTV_PART_LABELS: Record<CctvPartType, string> = {
  camera: "Camera",
  nvr: "NVR",
  poe_switch: "PoE Switch",
  hdd_storage: "HDD Storage",
  cat6_rj45_wire: "CAT6 & RJ45 Wire",
  networking_box: "RJ45 / Networking Box",
  monitor: "Monitor",
  junction_box: "Junction Box",
  installation_service: "Installation Service",
  accessories: "Other Accessories",
};

export const REQUIRED_CCTV_PART_TYPES: CctvPartType[] = [
  "camera",
  "nvr",
  "hdd_storage",
  "cat6_rj45_wire",
  "installation_service",
];
