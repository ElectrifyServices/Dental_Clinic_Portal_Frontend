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
  // Primary / Frequently Used
  { country: "IN", name: "India", code: "+91", flag: "🇮🇳", keywords: ["Bharat", "Hindustan"] },
  { country: "US", name: "United States", code: "+1", flag: "🇺🇸", keywords: ["USA", "America"] },
  { country: "GB", name: "United Kingdom", code: "+44", flag: "🇬🇧", keywords: ["UK", "Britain", "England"] },
  { country: "CA", name: "Canada", code: "+1", flag: "🇨🇦" },
  { country: "AU", name: "Australia", code: "+61", flag: "🇦🇺" },
  { country: "AE", name: "United Arab Emirates", code: "+971", flag: "🇦🇪", keywords: ["UAE", "Dubai", "Abu Dhabi"] },
  { country: "SA", name: "Saudi Arabia", code: "+966", flag: "🇸🇦", keywords: ["KSA"] },
  { country: "SG", name: "Singapore", code: "+65", flag: "🇸🇬" },

  // All UN Member Countries & Territories A-Z
  { country: "AF", name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { country: "AL", name: "Albania", code: "+355", flag: "🇦🇱" },
  { country: "DZ", name: "Algeria", code: "+213", flag: "🇩🇿" },
  { country: "AD", name: "Andorra", code: "+376", flag: "🇦🇩" },
  { country: "AO", name: "Angola", code: "+244", flag: "🇦🇴" },
  { country: "AG", name: "Antigua & Barbuda", code: "+1268", flag: "🇦🇬" },
  { country: "AR", name: "Argentina", code: "+54", flag: "🇦🇷" },
  { country: "AM", name: "Armenia", code: "+374", flag: "🇦🇲" },
  { country: "AT", name: "Austria", code: "+43", flag: "🇦🇹" },
  { country: "AZ", name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { country: "BS", name: "Bahamas", code: "+1242", flag: "🇧🇸" },
  { country: "BH", name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { country: "BD", name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { country: "BB", name: "Barbados", code: "+1246", flag: "🇧🇧" },
  { country: "BY", name: "Belarus", code: "+375", flag: "🇧🇾" },
  { country: "BE", name: "Belgium", code: "+32", flag: "🇧🇪" },
  { country: "BZ", name: "Belize", code: "+501", flag: "🇧🇿" },
  { country: "BJ", name: "Benin", code: "+229", flag: "🇧🇯" },
  { country: "BT", name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { country: "BO", name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { country: "BA", name: "Bosnia & Herzegovina", code: "+387", flag: "🇧🇦" },
  { country: "BW", name: "Botswana", code: "+267", flag: "🇧🇼" },
  { country: "BR", name: "Brazil", code: "+55", flag: "🇧🇷" },
  { country: "BN", name: "Brunei", code: "+673", flag: "🇧🇳" },
  { country: "BG", name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { country: "BF", name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { country: "BI", name: "Burundi", code: "+257", flag: "🇧🇮" },
  { country: "KH", name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { country: "CM", name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { country: "CV", name: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { country: "CF", name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { country: "TD", name: "Chad", code: "+235", flag: "🇹🇩" },
  { country: "CL", name: "Chile", code: "+56", flag: "🇨🇱" },
  { country: "CN", name: "China", code: "+86", flag: "🇨🇳" },
  { country: "CO", name: "Colombia", code: "+57", flag: "🇨🇴" },
  { country: "KM", name: "Comoros", code: "+269", flag: "🇰🇲" },
  { country: "CG", name: "Congo - Brazzaville", code: "+242", flag: "🇨🇬" },
  { country: "CD", name: "Congo - Kinshasa", code: "+243", flag: "🇨🇩" },
  { country: "CR", name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { country: "HR", name: "Croatia", code: "+385", flag: "🇭🇷" },
  { country: "CU", name: "Cuba", code: "+53", flag: "🇨🇺" },
  { country: "CY", name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { country: "CZ", name: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { country: "DK", name: "Denmark", code: "+45", flag: "🇩🇰" },
  { country: "DJ", name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { country: "DM", name: "Dominica", code: "+1767", flag: "🇩🇲" },
  { country: "DO", name: "Dominican Republic", code: "+1809", flag: "🇩🇴" },
  { country: "TL", name: "East Timor", code: "+670", flag: "🇹🇱" },
  { country: "EC", name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { country: "EG", name: "Egypt", code: "+20", flag: "🇪🇬" },
  { country: "SV", name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { country: "GQ", name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { country: "ER", name: "Eritrea", code: "+291", flag: "🇪🇷" },
  { country: "EE", name: "Estonia", code: "+372", flag: "🇪🇪" },
  { country: "SZ", name: "Eswatini", code: "+268", flag: "🇸🇿" },
  { country: "ET", name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { country: "FJ", name: "Fiji", code: "+679", flag: "🇫🇯" },
  { country: "FI", name: "Finland", code: "+358", flag: "🇫🇮" },
  { country: "FR", name: "France", code: "+33", flag: "🇫🇷" },
  { country: "GA", name: "Gabon", code: "+241", flag: "🇬🇦" },
  { country: "GM", name: "Gambia", code: "+220", flag: "🇬🇲" },
  { country: "GE", name: "Georgia", code: "+995", flag: "🇬🇪" },
  { country: "DE", name: "Germany", code: "+49", flag: "🇩🇪", keywords: ["Deutschland"] },
  { country: "GH", name: "Ghana", code: "+233", flag: "🇬🇭" },
  { country: "GR", name: "Greece", code: "+30", flag: "🇬🇷" },
  { country: "GD", name: "Grenada", code: "+1473", flag: "🇬🇩" },
  { country: "GT", name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { country: "GN", name: "Guinea", code: "+224", flag: "🇬🇳" },
  { country: "GW", name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { country: "GY", name: "Guyana", code: "+592", flag: "🇬🇾" },
  { country: "HT", name: "Haiti", code: "+509", flag: "🇭🇹" },
  { country: "HN", name: "Honduras", code: "+504", flag: "🇭🇳" },
  { country: "HK", name: "Hong Kong", code: "+852", flag: "🇭🇰" },
  { country: "HU", name: "Hungary", code: "+36", flag: "🇭🇺" },
  { country: "IS", name: "Iceland", code: "+354", flag: "🇮🇸" },
  { country: "ID", name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { country: "IR", name: "Iran", code: "+98", flag: "🇮🇷" },
  { country: "IQ", name: "Iraq", code: "+964", flag: "🇮🇶" },
  { country: "IE", name: "Ireland", code: "+353", flag: "🇮🇪" },
  { country: "IL", name: "Israel", code: "+972", flag: "🇮🇱" },
  { country: "IT", name: "Italy", code: "+39", flag: "🇮🇹" },
  { country: "CI", name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
  { country: "JM", name: "Jamaica", code: "+1876", flag: "🇯🇲" },
  { country: "JP", name: "Japan", code: "+81", flag: "🇯🇵" },
  { country: "JO", name: "Jordan", code: "+962", flag: "🇯🇴" },
  { country: "KZ", name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { country: "KE", name: "Kenya", code: "+254", flag: "🇰🇪" },
  { country: "KI", name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { country: "KP", name: "North Korea", code: "+850", flag: "🇰🇵" },
  { country: "KR", name: "South Korea", code: "+82", flag: "🇰🇷", keywords: ["Korea"] },
  { country: "KW", name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { country: "KG", name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { country: "LA", name: "Laos", code: "+856", flag: "🇱🇦" },
  { country: "LV", name: "Latvia", code: "+371", flag: "🇱🇻" },
  { country: "LB", name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { country: "LS", name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { country: "LR", name: "Liberia", code: "+231", flag: "🇱🇷" },
  { country: "LY", name: "Libya", code: "+218", flag: "🇱🇾" },
  { country: "LI", name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { country: "LT", name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { country: "LU", name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { country: "MO", name: "Macao", code: "+853", flag: "🇲🇴" },
  { country: "MG", name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { country: "MW", name: "Malawi", code: "+265", flag: "🇲🇼" },
  { country: "MY", name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { country: "MV", name: "Maldives", code: "+960", flag: "🇲🇻" },
  { country: "ML", name: "Mali", code: "+223", flag: "🇲🇱" },
  { country: "MT", name: "Malta", code: "+356", flag: "🇲🇹" },
  { country: "MH", name: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { country: "MR", name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { country: "MU", name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { country: "MX", name: "Mexico", code: "+52", flag: "🇲🇽" },
  { country: "FM", name: "Micronesia", code: "+691", flag: "🇫🇲" },
  { country: "MD", name: "Moldova", code: "+373", flag: "🇲🇩" },
  { country: "MC", name: "Monaco", code: "+377", flag: "🇲🇨" },
  { country: "MN", name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { country: "ME", name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { country: "MA", name: "Morocco", code: "+212", flag: "🇲🇦" },
  { country: "MZ", name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { country: "MM", name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { country: "NA", name: "Namibia", code: "+264", flag: "🇳🇦" },
  { country: "NR", name: "Nauru", code: "+674", flag: "🇳🇷" },
  { country: "NP", name: "Nepal", code: "+977", flag: "🇳🇵" },
  { country: "NL", name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { country: "NZ", name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { country: "NI", name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { country: "NE", name: "Niger", code: "+227", flag: "🇳🇪" },
  { country: "NG", name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { country: "MK", name: "North Macedonia", code: "+389", flag: "🇲🇰" },
  { country: "NO", name: "Norway", code: "+47", flag: "🇳🇴" },
  { country: "OM", name: "Oman", code: "+968", flag: "🇴🇲" },
  { country: "PK", name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { country: "PW", name: "Palau", code: "+680", flag: "🇵🇼" },
  { country: "PS", name: "Palestine", code: "+970", flag: "🇵🇸" },
  { country: "PA", name: "Panama", code: "+507", flag: "🇵🇦" },
  { country: "PG", name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { country: "PY", name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { country: "PE", name: "Peru", code: "+51", flag: "🇵🇪" },
  { country: "PH", name: "Philippines", code: "+63", flag: "🇵🇭" },
  { country: "PL", name: "Poland", code: "+48", flag: "🇵🇱" },
  { country: "PT", name: "Portugal", code: "+351", flag: "🇵🇹" },
  { country: "PR", name: "Puerto Rico", code: "+1787", flag: "🇵🇷" },
  { country: "QA", name: "Qatar", code: "+974", flag: "🇶🇦" },
  { country: "RO", name: "Romania", code: "+40", flag: "🇷🇴" },
  { country: "RU", name: "Russia", code: "+7", flag: "🇷🇺" },
  { country: "RW", name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { country: "KN", name: "Saint Kitts & Nevis", code: "+1869", flag: "🇰🇳" },
  { country: "LC", name: "Saint Lucia", code: "+1758", flag: "🇱🇨" },
  { country: "VC", name: "Saint Vincent & Grenadines", code: "+1784", flag: "🇻🇨" },
  { country: "WS", name: "Samoa", code: "+685", flag: "🇼🇸" },
  { country: "SM", name: "San Marino", code: "+378", flag: "🇸🇲" },
  { country: "ST", name: "Sao Tome & Principe", code: "+239", flag: "🇸🇹" },
  { country: "SN", name: "Senegal", code: "+221", flag: "🇸🇳" },
  { country: "RS", name: "Serbia", code: "+381", flag: "🇷🇸" },
  { country: "SC", name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { country: "SL", name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { country: "SK", name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { country: "SI", name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { country: "SB", name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { country: "SO", name: "Somalia", code: "+252", flag: "🇸🇴" },
  { country: "ZA", name: "South Africa", code: "+27", flag: "🇿🇦" },
  { country: "SS", name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { country: "ES", name: "Spain", code: "+34", flag: "🇪🇸" },
  { country: "LK", name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { country: "SD", name: "Sudan", code: "+249", flag: "🇸🇩" },
  { country: "SR", name: "Suriname", code: "+597", flag: "🇸🇷" },
  { country: "SE", name: "Sweden", code: "+46", flag: "🇸🇪" },
  { country: "CH", name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { country: "SY", name: "Syria", code: "+963", flag: "🇸🇾" },
  { country: "TW", name: "Taiwan", code: "+886", flag: "🇹🇼" },
  { country: "TJ", name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { country: "TZ", name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { country: "TH", name: "Thailand", code: "+66", flag: "🇹🇭" },
  { country: "TG", name: "Togo", code: "+228", flag: "🇹🇬" },
  { country: "TO", name: "Tonga", code: "+676", flag: "🇹🇴" },
  { country: "TT", name: "Trinidad & Tobago", code: "+1868", flag: "🇹🇹" },
  { country: "TN", name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { country: "TR", name: "Turkey", code: "+90", flag: "🇹🇷" },
  { country: "TM", name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { country: "TV", name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { country: "UG", name: "Uganda", code: "+256", flag: "🇺🇬" },
  { country: "UA", name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { country: "UY", name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { country: "UZ", name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { country: "VU", name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { country: "VA", name: "Vatican City", code: "+39", flag: "🇻🇦" },
  { country: "VE", name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { country: "VN", name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { country: "YE", name: "Yemen", code: "+967", flag: "🇾🇪" },
  { country: "ZM", name: "Zambia", code: "+260", flag: "🇿🇲" },
  { country: "ZW", name: "Zimbabwe", code: "+263", flag: "🇿🇼" },
];

interface CountryCodeSelectProps {
  value?: string;
  onChange: (val: string) => void;
  /** Optional: also receive the full CountryCodeItem (including ISO alpha-2 country code) on select */
  onCountrySelect?: (item: CountryCodeItem) => void;
  disabled?: boolean;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value = "+91",
  onChange,
  onCountrySelect,
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
    onCountrySelect?.(item);
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
