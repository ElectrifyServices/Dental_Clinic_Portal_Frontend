import * as React from "react";
import { Search, Check, X, Plus, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onCreateOption?: (value: string) => Promise<void> | void;
  createLabel?: string;
  isCreating?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  isLoading = false,
  disabled = false,
  onCreateOption,
  createLabel = "Create",
  isCreating = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Clear query on close or open
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const exactMatchExists = React.useMemo(() => {
    return options.some(
      (option) => option.toLowerCase() === searchQuery.toLowerCase()
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (onCreateOption && searchQuery.trim()) {
      await onCreateOption(searchQuery.trim());
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || isLoading}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">
            {isLoading
              ? "Loading..."
              : value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1.5 min-w-[240px]">
        <div className="relative flex items-center border-b border-border pb-1.5 mb-1.5">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-7 py-2 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left hover:bg-muted/50 rounded-lg transition-colors cursor-pointer",
                    isSelected ? "text-primary bg-primary/5" : "text-foreground"
                  )}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2.5 text-xs text-muted-foreground text-center font-medium">
              No results found.
            </div>
          )}
        </div>

        {onCreateOption && !exactMatchExists && searchQuery.trim().length >= 2 && (
          <div className="border-t border-border/60 mt-1.5 pt-1.5 px-0.5">
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreate}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-semibold text-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>{createLabel} "{searchQuery.trim()}"</span>
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
