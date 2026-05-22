"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="grid min-w-0 grid-cols-2 items-start gap-3 overflow-hidden rounded-2xl border border-slate-300 bg-white p-3 xl:grid-cols-[52px_minmax(180px,1fr)_72px_108px_108px_56px] xl:gap-2.5">
      <div className="col-span-2 min-w-0 xl:col-span-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          S.N.
        </label>
        <div className="flex h-9 w-full min-w-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-center text-sm font-semibold text-slate-700">
          {index + 1}
        </div>
      </div>

      <div className="col-span-2 min-w-0 xl:col-span-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Description
        </label>
        <Textarea
          value={item.description}
          onChange={(event) => onChange(index, "description", event.target.value)}
          placeholder="Product or service description"
          className="w-full min-w-0 min-h-12 max-h-28 resize-y border-slate-200 bg-white"
        />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Qty
        </label>
        <Input
          type="number"
          min={1}
          step="1"
          value={item.quantity}
          onChange={(event) => onChange(index, "quantity", Number(event.target.value))}
          className="w-full min-w-0 border-slate-200 bg-white"
        />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Unit Price
        </label>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={item.unitPrice || ""}
          onChange={(event) => onChange(index, "unitPrice", Number(event.target.value))}
          className="w-full min-w-0 border-slate-200 bg-white"
        />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Total
        </label>
        <div className="flex h-9 w-full min-w-0 items-center justify-end overflow-hidden rounded-md border border-slate-200 bg-slate-50 px-3 text-right text-sm font-bold text-slate-700">
          {lineTotal.toFixed(2)}
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-start xl:items-center">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Remove
        </label>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={disableRemove}
          className="h-9 w-9 max-w-full rounded-md border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label={`Remove quotation item ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
