"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Link as LinkIcon, Sparkles, Check, Wand2, Upload, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Curated high-resolution Unsplash images grouped by category
const PRESET_GALLERY: Record<string, { label: string; url: string }[]> = {
  Devices: [
    { label: "iPhone & Smartphone", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" },
    { label: "MacBook & Laptop", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80" },
    { label: "Apple Watch & Wearables", url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80" },
    { label: "AirPods & Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  ],
  Technology: [
    { label: "Modern Laptop Workspace", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80" },
    { label: "Futuristic Code Screen", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80" },
    { label: "Developer Setup", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80" },
    { label: "Smart Desk Neon Glow", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80" },
  ],
  Study: [
    { label: "Focused Study & Books", url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80" },
    { label: "Clean Notebook & Coffee", url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80" },
    { label: "Library Concentration", url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80" },
  ],
  Finance: [
    { label: "Wealth & Investment Growth", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80" },
    { label: "Crypto & Finance Tech", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80" },
    { label: "Luxury Savings Goal", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80" },
  ],
  Lifestyle: [
    { label: "Fitness & Training Goal", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" },
    { label: "Travel & Adventure Destination", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80" },
    { label: "Mindfulness & Meditation", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" },
  ],
};

const KEYWORD_IMAGE_MAP = [
  {
    keywords: ["iphone", "phone", "smartphone", "mobile", "ios", "pro max", "galaxy"],
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    label: "iPhone & Smartphone",
  },
  {
    keywords: ["macbook", "mac", "laptop", "computer", "pc", "code", "dev", "program", "tech", "software"],
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    label: "MacBook & Laptop",
  },
  {
    keywords: ["airpod", "headphone", "earbud", "audio", "sound", "speaker"],
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    label: "AirPods & Audio",
  },
  {
    keywords: ["watch", "apple watch", "smartwatch", "wearable"],
    url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80",
    label: "Apple Watch & Wearables",
  },
  {
    keywords: ["study", "exam", "book", "read", "math", "course", "learn", "homework", "degree", "test", "school"],
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    label: "Study & Academics",
  },
  {
    keywords: ["workout", "gym", "fitness", "health", "run", "sport", "exercise", "diet", "habit", "meditat", "sleep"],
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    label: "Fitness & Training",
  },
  {
    keywords: ["money", "sav", "buy", "finance", "invest", "crypto", "fund", "budget", "bank", "wallet", "dollar", "wealth", "cash", "house"],
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    label: "Finance & Wealth Goal",
  },
  {
    keywords: ["travel", "vacation", "trip", "flight", "car", "beach", "hotel", "explore", "nature", "tour"],
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
    label: "Travel & Destination",
  },
];

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  titleQuery?: string;
}

export function ImagePicker({
  value,
  onChange,
  label = "Image / Cover Photo",
  titleQuery = "",
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(value || "");
  const [selectedCategory, setSelectedCategory] = useState("Devices");
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Auto-Match detection as user types the Title!
  const autoMatchedImage = useMemo(() => {
    if (!titleQuery || titleQuery.trim().length < 2) return null;
    const lower = titleQuery.toLowerCase();
    for (const item of KEYWORD_IMAGE_MAP) {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        return item;
      }
    }
    return null;
  }, [titleQuery]);

  // Auto-fill image if title matches and no image was manually selected yet
  useEffect(() => {
    if (autoMatchedImage && (!value || isAutoFilled)) {
      onChange(autoMatchedImage.url);
      setCustomUrl(autoMatchedImage.url);
      setIsAutoFilled(true);
    }
  }, [autoMatchedImage, value, isAutoFilled, onChange]);

  // Handle local device image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Resize/compress to max 800px width/height for fast performance
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onChange(dataUrl);
        setCustomUrl(dataUrl);
        setIsAutoFilled(false);
        setIsOpen(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    onChange(url);
    setCustomUrl(url);
    setIsAutoFilled(false);
    setIsOpen(false);
  };

  const handleApplyCustomUrl = () => {
    onChange(customUrl);
    setIsAutoFilled(false);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input for native device upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label}</Label>
        {autoMatchedImage && (
          <span className="text-[11px] text-accent flex items-center gap-1 font-medium">
            <Wand2 className="h-3 w-3 animate-pulse" />
            Auto-Matched: &quot;{autoMatchedImage.label}&quot;
          </span>
        )}
      </div>

      {/* Main Bar */}
      <div className="flex gap-2 items-center">
        {/* Preview Thumbnail */}
        {value ? (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/40 shrink-0 bg-muted/20 relative group shadow-sm">
            <img src={value} alt="Selected preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg border border-dashed border-border/50 shrink-0 flex items-center justify-center bg-muted/10 text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}

        {/* Input field */}
        <Input
          type="url"
          value={value}
          onChange={(e) => {
            setIsAutoFilled(false);
            onChange(e.target.value);
          }}
          placeholder="Paste image URL or upload photo..."
          className="bg-muted/50 border-border/50 text-xs flex-1"
        />

        {/* Upload From Device Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-border/60 hover:bg-muted/60 shrink-0 text-xs gap-1"
          title="Upload image file from device"
        >
          <Upload className="h-3.5 w-3.5 text-primary" />
          Device
        </Button>

        {/* Gallery Modal Trigger */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/20 shrink-0 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Gallery
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-card border-border/50 sm:max-w-[600px] p-4">
            <DialogHeader>
              <DialogTitle className="gradient-text flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Image Gallery & Device Upload
              </DialogTitle>
            </DialogHeader>

            {/* Upload from Device Option */}
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Upload from Device</p>
                  <p className="text-[11px] text-muted-foreground">Select any photo from your phone or computer</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
              >
                Choose File
              </Button>
            </div>

            {/* Custom URL Input Bar */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs text-muted-foreground">Or paste direct Web / Google Image URL:</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Google Image link"
                    className="pl-8 bg-muted/50 border-border/50 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyCustomUrl}
                  className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs"
                >
                  Use URL
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 border-b border-border/30 pb-2 mt-4 overflow-x-auto">
              {Object.keys(PRESET_GALLERY).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pt-2">
              {PRESET_GALLERY[selectedCategory]?.map((preset, idx) => {
                const isSelected = value === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={cn(
                      "relative rounded-xl overflow-hidden border transition-all text-left group h-28 bg-muted/20",
                      isSelected
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border/40 hover:border-primary/60 hover:scale-[1.02]"
                    )}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[11px] font-semibold text-white truncate">
                        {preset.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Auto-Match Quick Chip Suggestion */}
      {autoMatchedImage && (
        <div className="glass p-2 rounded-lg border border-accent/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={autoMatchedImage.url}
              alt={autoMatchedImage.label}
              className="w-7 h-7 rounded object-cover border border-accent/40"
            />
            <span className="truncate text-muted-foreground">
              Matched: <strong className="text-foreground">{autoMatchedImage.label}</strong>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-accent hover:bg-accent/20 px-2 shrink-0"
            onClick={() => {
              onChange(autoMatchedImage.url);
              setIsAutoFilled(true);
            }}
          >
            Apply Match
          </Button>
        </div>
      )}
    </div>
  );
}
