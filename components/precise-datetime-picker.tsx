"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface PreciseDateTimePickerProps {
  value: string; // ISO or YYYY-MM-THH:mm
  onChange: (formattedValue: string) => void;
  label?: string;
}

export function PreciseDateTimePicker({
  value,
  onChange,
  label = "Target Deadline (Exact Hour & Minute)",
}: PreciseDateTimePickerProps) {
  const formatForInput = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const [inputValue, setInputValue] = useState(formatForInput(value));

  useEffect(() => {
    setInputValue(formatForInput(value));
  }, [value]);

  const handleChange = (newVal: string) => {
    setInputValue(newVal);
    onChange(newVal);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          {label}
        </Label>
        {inputValue && (
          <span className="text-[11px] font-mono text-primary font-bold">
            {new Date(inputValue).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        )}
      </div>

      <div className="relative">
        <Input
          type="datetime-local"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-muted/60 border-border/50 text-xs font-mono font-semibold py-2 px-3 focus-visible:ring-1 focus-visible:ring-primary"
          required
        />
      </div>
    </div>
  );
}
