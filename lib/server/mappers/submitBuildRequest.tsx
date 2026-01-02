import { SelectedParts } from "@/components/client/buildMyPc";


 enum UseCase {
  Gaming = "gaming",
  Editing = "editing",
  Office = "office",

}

export enum CPUBrand {
  Intel = "intel",
  AMD = "amd",
  Any = "any",

}

export enum GPUBrand {
  Nvidia = "nvidia",
  AMD = "amd",
  Intel = "intel",
  Any = "any",
}

const mapCPUBrand = (brand?: string): CPUBrand | undefined => {
  if (!brand) return undefined;

  const normalized = brand.toLowerCase();

  if (normalized.includes("intel")) return CPUBrand.Intel;
  if (normalized.includes("amd")) return CPUBrand.AMD;

  return undefined;
};

const mapGPUBrand = (brand?: string): GPUBrand | undefined => {
  if (!brand) return undefined;

  const normalized = brand.toLowerCase();

  if (normalized.includes("nvidia")) return GPUBrand.Nvidia;
  if (normalized.includes("amd")) return GPUBrand.AMD;
  if (normalized.includes("intel")) return GPUBrand.Intel;

  return undefined;
};


export const mapSelectedPartsToBuildInput = (
  selected: SelectedParts
) => {
  const totalBudget = Object.values(selected).reduce(
    (sum, p) => sum + (p?.price || 0),
    0
  );

  return {
    budgetNPR: totalBudget,

    uses: [UseCase.Office],

    cpuPreference: mapCPUBrand(selected.cpu?.brand),
    cpuModel: selected.cpu?.name,

    gpuPreference: mapGPUBrand(selected.gpu?.brand),
    gpuModel: selected.gpu?.name,

    ramGB: selected.ram ? selected.ram.capacityGB : undefined,
    ramType: selected.ram?.ramType,

    peripherals: {
      monitor: !!selected.monitor,
      keyboard: !!selected.keyboard,
      mouse: !!selected.mouse,
      ups: !!selected.ups,
    },
  };
};

