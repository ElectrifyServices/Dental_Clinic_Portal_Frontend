import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";

interface HourMinPickerProps {
  value: string;
  onChange: (newValue: string) => void;
  optional?: boolean;
}

export function HourMinPicker({ value, onChange, optional = false }: HourMinPickerProps) {
  const parts = value && typeof value === "string" ? value.split(":") : [];
  const hRaw = parts[0] || "";
  const mRaw = parts[1] || "";
  const hStr = /^\d{2}$/.test(hRaw) ? hRaw : "";
  const mStr = /^\d{2}$/.test(mRaw) ? mRaw : "";

  const hours = Array.from({ length: 24 }, (_, i) => {
    const val = String(i).padStart(2, "0");
    const ampm = i >= 12 ? "PM" : "AM";
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    const label = `${String(displayHour).padStart(2, "0")} ${ampm}`;
    return { val, label };
  });

  const minutes = Array.from({ length: 12 }, (_, i) => {
    const val = String(i * 5).padStart(2, "0");
    return val;
  });

  const handleHourChange = (newH: string) => {
    if (!newH || newH === "empty") {
      onChange("");
      return;
    }
    const currentM = mStr ? mStr : "00";
    onChange(`${newH}:${currentM}`);
  };

  const handleMinChange = (newM: string) => {
    if (!newM || newM === "empty") {
      if (optional) {
        onChange("");
      }
      return;
    }
    const currentH = hStr ? hStr : "09";
    onChange(`${currentH}:${newM}`);
  };

  return (
    <div className="flex gap-1 items-center w-full">
      <Select value={hStr || "empty"} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[60%] px-1.5 py-1.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card h-9">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {optional && <SelectItem value="empty">None (Clear)</SelectItem>}
          {hours.map((h) => (
            <SelectItem key={h.val} value={h.val}>
              {h.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-black text-xs">:</span>
      <Select value={mStr || "empty"} onValueChange={handleMinChange} disabled={!hStr}>
        <SelectTrigger className="w-[40%] px-1.5 py-1.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none bg-card disabled:opacity-50 h-9">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {optional && <SelectItem value="empty">Min</SelectItem>}
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
