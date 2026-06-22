import * as React from "react";
import { Search, Check, X, Plus, ChevronDown, Trash2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

type OptionType = string | { label: string; value: string };

interface SearchableSelectProps {
  value: string | string[];
  onChange: (value: any) => void;
  options: OptionType[];
  placeholder?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onCreateOption?: (value: string) => Promise<string | void> | void;
  createLabel?: string;
  isCreating?: boolean;
  onDeleteOption?: (value: string) => Promise<void> | void;
  isDeletingValue?: string | null;
  isMulti?: boolean;
  className?: string;
  onSearchChange?: (query: string) => void;
  displayValue?: React.ReactNode | string;
  renderOption?: (option: any) => React.ReactNode;
  renderValue?: (option: any) => React.ReactNode;
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
  onDeleteOption,
  isDeletingValue = null,
  isMulti = false,
  className,
  onSearchChange,
  displayValue,
  renderOption,
  renderValue,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Clear query on close or open
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      onSearchChange?.("");
    }
  }, [isOpen]);

  const getOptionLabel = (opt: OptionType) => typeof opt === 'string' ? opt : (opt.label || "");
  const getOptionValue = (opt: OptionType) => typeof opt === 'string' ? opt : (opt.value || "");

  const filteredOptions = React.useMemo(() => {
    if (onSearchChange) return options;
    return options.filter((option) => {
      const searchStr = typeof option === 'string' 
        ? option 
        : (option.searchLabel || option.label || "");
      return searchStr.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [options, searchQuery, onSearchChange]);

  const exactMatchExists = React.useMemo(() => {
    return options.some(
      (option) => getOptionLabel(option).toLowerCase() === searchQuery.toLowerCase()
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(val)
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];
      onChange(newValues);
    } else {
      onChange(val);
      setIsOpen(false);
    }
  };

  const handleCreate = async () => {
    if (onCreateOption && searchQuery.trim()) {
      const query = searchQuery.trim();
      const createdValue = await onCreateOption(query);
      handleSelect(typeof createdValue === 'string' ? createdValue : query);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          disabled={disabled || isLoading}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-border/80 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer transition-all duration-200 ease-out",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex-1 truncate pr-2 text-left">
            {isLoading
              ? "Loading..."
              : isMulti
                ? (Array.isArray(value) && value.length > 0 ? `${value.length} selected` : placeholder)
                : (
                    options.find(opt => getOptionValue(opt) === value) 
                      ? (renderValue ? renderValue(options.find(opt => getOptionValue(opt) === value)) : getOptionLabel(options.find(opt => getOptionValue(opt) === value)!))
                      : displayValue || value
                  ) || placeholder}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1.5 min-w-[240px]">
        <div className="relative flex items-center border-b border-border pb-1.5 mb-1.5">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search-query"
            autoComplete="off"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-9 pr-7 py-2 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all duration-200 focus:pl-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                onSearchChange?.("");
              }}
              className="absolute right-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted outline-none transition-all duration-150"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div 
          className="max-h-[420px] overflow-y-auto space-y-0.5 custom-scrollbar"
          onWheelCapture={(e) => e.stopPropagation()}
          onTouchMoveCapture={(e) => e.stopPropagation()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => {
              const optValue = getOptionValue(opt);
              const optLabel = getOptionLabel(opt);
              const isSelected = isMulti 
                ? Array.isArray(value) && value.includes(optValue)
                : value === optValue;
              return (
                <div
                  key={optValue || i}
                  className={cn(
                    "w-full flex items-center justify-between group text-xs font-semibold hover:bg-muted/70 rounded-lg transition-all duration-150 active:scale-[0.99]",
                    isSelected ? "text-primary bg-primary/5" : "text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(optValue)}
                    className="flex-1 text-left flex items-center justify-between px-3 py-2 cursor-pointer bg-transparent outline-none transition-colors duration-150"
                  >
                    {renderOption ? (
                      renderOption(opt)
                    ) : (
                      <span className="truncate pr-2">{optLabel}</span>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />}
                  </button>
                  {onDeleteOption && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteOption(optValue);
                      }}
                      disabled={isDeletingValue === optValue}
                      className="p-1.5 mx-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-150 flex-shrink-0 active:scale-90"
                    >
                      {isDeletingValue === optValue ? (
                        <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
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
