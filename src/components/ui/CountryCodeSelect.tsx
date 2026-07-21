import React, { useState, useMemo, useRef, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Search, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountryCodeItem {
  country: string; // ISO code e.g. "IN"
  name: string;    // Full country name
  code: string;    // Dialing code e.g. "+91"
  flag: string;    // Flag emoji
  keywords?: string[];
}

export const COUNTRY_CODES_LIST: CountryCodeItem[] = [
  // Primary / Default
  { country: "IN", name: "India", code: "+91", flag: "🇮🇳", keywords: ["Bharat", "Hindustan"] },

  // North America & Western
  { country: "US", name: "United States", code: "+1", flag: "🇺🇸", keywords: ["USA", "America"] },
  { country: "CA", name: "Canada", code: "+1", flag: "🇨🇦" },
  { country: "GB", name: "United Kingdom", code: "+44", flag: "🇬🇧", keywords: ["UK", "Britain", "England"] },
  { country: "AU", name: "Australia", code: "+61", flag: "🇦🇺", keywords: ["Oz"] },
  { country: "NZ", name: "New Zealand", code: "+64", flag: "🇳🇿" },

  // Asia Pacific
  { country: "SG", name: "Singapore", code: "+65", flag: "🇸🇬" },
  { country: "MY", name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { country: "TH", name: "Thailand", code: "+66", flag: "🇹🇭" },
  { country: "ID", name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { country: "PH", name: "Philippines", code: "+63", flag: "🇵🇭" },
  { country: "VN", name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { country: "JP", name: "Japan", code: "+81", flag: "🇯🇵" },
  { country: "KR", name: "South Korea", code: "+82", flag: "🇰🇷", keywords: ["Korea"] },
  { country: "CN", name: "China", code: "+86", flag: "🇨🇳" },
  { country: "HK", name: "Hong Kong", code: "+852", flag: "🇭🇰" },
  { country: "TW", name: "Taiwan", code: "+886", flag: "🇹🇼" },

  // Middle East
  { country: "AE", name: "United Arab Emirates", code: "+971", flag: "🇦🇪", keywords: ["Dubai", "Abu Dhabi", "UAE", "Emirates"] },
  { country: "SA", name: "Saudi Arabia", code: "+966", flag: "🇸🇦", keywords: ["KSA", "Riyadh"] },
  { country: "QA", name: "Qatar", code: "+974", flag: "🇶🇦", keywords: ["Doha"] },
  { country: "KW", name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { country: "OM", name: "Oman", code: "+968", flag: "🇴🇲", keywords: ["Muscat"] },
  { country: "BH", name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { country: "IQ", name: "Iraq", code: "+964", flag: "🇮🇶" },
  { country: "JO", name: "Jordan", code: "+962", flag: "🇯🇴" },
  { country: "LB", name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { country: "IL", name: "Israel", code: "+972", flag: "🇮🇱" },

  // Europe
  { country: "DE", name: "Germany", code: "+49", flag: "🇩🇪", keywords: ["Deutschland"] },
  { country: "FR", name: "France", code: "+33", flag: "🇫🇷" },
  { country: "ES", name: "Spain", code: "+34", flag: "🇪🇸" },
  { country: "IT", name: "Italy", code: "+39", flag: "🇮🇹" },
  { country: "NL", name: "Netherlands", code: "+31", flag: "🇳🇱", keywords: ["Holland"] },
  { country: "BE", name: "Belgium", code: "+32", flag: "🇧🇪" },
  { country: "CH", name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { country: "SE", name: "Sweden", code: "+46", flag: "🇸🇪" },
  { country: "NO", name: "Norway", code: "+47", flag: "🇳🇴" },
  { country: "DK", name: "Denmark", code: "+45", flag: "🇩🇰" },
  { country: "FI", name: "Finland", code: "+358", flag: "🇫🇮" },
  { country: "IE", name: "Ireland", code: "+353", flag: "🇮🇪" },
  { country: "PL", name: "Poland", code: "+48", flag: "🇵🇱" },
  { country: "PT", name: "Portugal", code: "+351", flag: "🇵🇹" },
  { country: "AT", name: "Austria", code: "+43", flag: "🇦🇹" },

  // Africa
  { country: "ZA", name: "South Africa", code: "+27", flag: "🇿🇦" },
  { country: "EG", name: "Egypt", code: "+20", flag: "🇪🇬" },
  { country: "NG", name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { country: "KE", name: "Kenya", code: "+254", flag: "🇰🇪" },

  // Americas
  { country: "BR", name: "Brazil", code: "+55", flag: "🇧🇷" },
  { country: "AR", name: "Argentina", code: "+54", flag: "🇦🇷" },
  { country: "CL", name: "Chile", code: "+56", flag: "🇨🇱" },
  { country: "CO", name: "Colombia", code: "+57", flag: "🇨🇴" },
  { country: "MX", name: "Mexico", code: "+52", flag: "🇲🇽" },
];

interface CountryCodeSelectProps {
  value?: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value = "+91",
  onChange,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find selected country (defaulting to India +91)
  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_CODES_LIST.find((c) => c.code === value) ||
      COUNTRY_CODES_LIST.find((c) => c.country === "IN") ||
      COUNTRY_CODES_LIST[0]
    );
  }, [value]);

  // Filter countries by name, code, ISO, or keywords
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_CODES_LIST;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRY_CODES_LIST.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q) || item.code.replace("+", "").includes(q);
      const matchIso = item.country.toLowerCase().includes(q);
      const matchKw = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchName || matchCode || matchIso || matchKw;
    });
  }, [searchQuery]);

  // Reset search and focus on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Auto-scroll active item into view when using keyboard
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCountries[activeIndex]) {
        handleSelect(filteredCountries[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (item: CountryCodeItem) => {
    onChange(item.code);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-24 sm:w-28 shrink-0 h-11 px-2.5 flex items-center justify-between gap-1 rounded-xl border border-border bg-card text-foreground font-bold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-bold text-foreground text-xs">{selectedCountry.code}</span>
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-0.5", isOpen && "rotate-180")} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-0 rounded-2xl shadow-modal border-border/80 z-[100] overflow-hidden flex flex-col">
        {/* Sticky Search Header */}
        <div className="p-2.5 bg-muted/40 border-b border-border/60 sticky top-0 z-10 backdrop-blur-md shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search country, +code, ISO..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-background border border-border/80 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Country List */}
        <div
          ref={listRef}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain touch-pan-y focus:outline-none"
          style={{ pointerEvents: "auto", maxH: "256px" }}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((item, idx) => {
              const isSelected = item.code === selectedCountry.code && item.country === selectedCountry.country;
              const isActive = idx === activeIndex;

              return (
                <button
                  key={`${item.country}-${item.code}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full px-3 py-2 flex items-center justify-between rounded-xl text-xs transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : isActive
                        ? "bg-muted text-foreground font-semibold"
                        : "text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-base leading-none shrink-0">{item.flag}</span>
                    <span className="truncate font-medium text-xs">{item.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase shrink-0">({item.country})</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn("font-bold text-xs", isSelected ? "text-primary" : "text-muted-foreground")}>
                      {item.code}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-0.5" />}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground font-medium">
              No matching countries found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
