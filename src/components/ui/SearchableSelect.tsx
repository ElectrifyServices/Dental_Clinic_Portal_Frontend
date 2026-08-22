import * as React from "react";
import { Search, Check, X, Plus, ChevronDown, Trash2, Edit } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

type OptionType = string | { label: string; value: string; is_free?: boolean; isFree?: boolean; from_plan_benefit?: boolean; fromPlanBenefit?: boolean; [key: string]: any };

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
  onEditOption?: (value: string, newValue: string) => Promise<void> | void;
  isDeletingValue?: string | null;
  isMulti?: boolean;
  className?: string;
  onSearchChange?: (query: string) => void;
  displayValue?: React.ReactNode | string;
  renderOption?: (option: any) => React.ReactNode;
  renderValue?: (option: any) => React.ReactNode;
  capitalizeWords?: boolean;
  popoverClassName?: string;
  onOpenChange?: (open: boolean) => void;
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
  onEditOption,
  isDeletingValue = null,
  isMulti = false,
  className,
  onSearchChange,
  displayValue,
  renderOption,
  renderValue,
  capitalizeWords = false,
  popoverClassName,
  onOpenChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editingValue, setEditingValue] = React.useState<string | null>(null);
  const [editInputValue, setEditInputValue] = React.useState("");

  // Clear query on close or open
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      onSearchChange?.("");
      setEditingValue(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Close on scroll to prevent detached popover from overlapping headers
  React.useEffect(() => {
    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the popover itself
      const target = e.target as HTMLElement;
      if (target && target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleSaveEdit = async (optValue: string) => {
    if (onEditOption && editInputValue.trim() && editInputValue.trim() !== optValue) {
      try {
        await onEditOption(optValue, editInputValue.trim());
      } catch (err) {
        // Handled
      }
    }
    setEditingValue(null);
  };

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
      try {
        const createdValue = await onCreateOption(query);
        if (createdValue) {
          handleSelect(typeof createdValue === 'string' ? createdValue : query);
          setIsOpen(false);
        }
      } catch (error) {
        // Do not add the option or close the popover if creation fails
      }
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
                : (() => {
                    const foundOpt = options.find(opt => getOptionValue(opt) === value);
                    if (foundOpt) {
                      if (renderValue) return renderValue(foundOpt);
                      const isFree = typeof foundOpt === "object" && foundOpt !== null && (foundOpt.isFree || foundOpt.is_free);
                      return (
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{getOptionLabel(foundOpt)}</span>
                          {isFree && (
                            <span className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-green-200/50 flex-shrink-0">
                              Free
                            </span>
                          )}
                        </span>
                      );
                    }
                    // If value exists but option not found in list (loading / no match), show displayValue or placeholder
                    if (displayValue) return displayValue;
                    if (value && value !== "none") return value;
                    return placeholder;
                  })()}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-[var(--radix-popover-trigger-width)] p-1.5 min-w-[240px]", popoverClassName)}>
        <div className="relative flex items-center border-b border-border pb-1.5 mb-1.5">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="search-query"
            autoComplete="off"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              let val = e.target.value;
              if (capitalizeWords) {
                val = val.replace(/\b\w/g, (c) => c.toUpperCase());
              }
              setSearchQuery(val);
              onSearchChange?.(val);
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
          className="max-h-[250px] overflow-y-auto space-y-0.5 custom-scrollbar"
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
                  {editingValue === optValue ? (
                    <div className="flex-1 flex items-center gap-1.5 px-3 py-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editInputValue}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (capitalizeWords) {
                            val = val.replace(/\b\w/g, (c) => c.toUpperCase());
                          }
                          setEditInputValue(val);
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-primary rounded-lg bg-card outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(optValue);
                          } else if (e.key === "Escape") {
                            setEditingValue(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(optValue)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Save"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingValue(null)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={typeof opt === "object" && opt !== null ? !!opt.disabled : false}
                        onClick={() => handleSelect(optValue)}
                        className={cn(
                          "flex-1 text-left flex items-center justify-between px-3 py-2 outline-none transition-colors duration-150",
                          typeof opt === "object" && opt !== null && opt.disabled
                            ? "cursor-not-allowed opacity-40 bg-muted/20"
                            : "cursor-pointer bg-transparent"
                        )}
                      >
                        {renderOption ? (
                          renderOption(opt)
                        ) : (
                          <span className="truncate pr-2 flex items-center gap-1.5">
                            <span>{optLabel}</span>
                            {typeof opt === "object" && opt !== null && (opt.isFree || opt.is_free) && (
                              <span className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-green-200/50 flex-shrink-0">
                                Free
                              </span>
                            )}
                          </span>
                        )}
                        {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />}
                      </button>
                      {onEditOption && optValue !== "none" && optValue !== "" && !(typeof opt === "object" && opt !== null && (opt.fromPlanBenefit || opt.from_plan_benefit)) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingValue(optValue);
                            setEditInputValue(optLabel);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all duration-150 flex-shrink-0 active:scale-90"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {onDeleteOption && optValue !== "none" && optValue !== "" && !(typeof opt === "object" && opt !== null && (opt.fromPlanBenefit || opt.from_plan_benefit)) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDeleteOption(optValue);
                          }}
                          disabled={isDeletingValue === optValue}
                          className="p-1.5 mx-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-150 flex-shrink-0 active:scale-90"
                          title="Delete"
                        >
                          {isDeletingValue === optValue ? (
                            <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </>
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
