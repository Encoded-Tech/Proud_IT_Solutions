"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuotationItemInput } from "@/types/quotation";

interface QuotationItemRowProps {
  item: QuotationItemInput;
  index: number;
  onChange: (
    index: number,
    field: keyof Pick<QuotationItemInput, "description" | "quantity" | "unitPrice">,
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
  disableRemove: boolean;
}

export default function QuotationItemRow({
  item,
  index,
  onChange,
  onRemove,
  disableRemove,
}: QuotationItemRowProps) {
  const lineTotal = Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0);

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[64px_minmax(0,1fr)_100px_130px_130px_56px]">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          S.N.
        </label>
        <div className="flex h-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
          {index + 1}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Description
        </label>
        <Input
          value={item.description}
          onChange={(event) => onChange(index, "description", event.target.value)}
          placeholder="Product or service description"
          className="border-slate-200 bg-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Qty
        </label>
        <Input
          type="number"
          min={1}
          step="1"
          value={item.quantity}
          onChange={(event) => onChange(index, "quantity", Number(event.target.value))}
          className="border-slate-200 bg-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Unit Price
        </label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={item.unitPrice}
          onChange={(event) => onChange(index, "unitPrice", Number(event.target.value))}
          className="border-slate-200 bg-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Total
        </label>
        <div className="flex h-10 items-center justify-end rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
          {lineTotal.toFixed(2)}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Remove
        </label>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          className="h-10 w-10 rounded-md border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label={`Remove quotation item ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
