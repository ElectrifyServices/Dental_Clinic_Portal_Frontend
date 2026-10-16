import React, { useState } from "react";
import { LayoutGrid, List, Filter, X } from "lucide-react";
import {
  Button,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface PatientFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  viewMode,
  setViewMode,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = [filterStatus !== "all", filterCategory !== "all"].filter(Boolean).length;

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-border shadow-sm w-full min-w-0">
        <div className="flex-1 min-w-0">
          <SearchInput
            placeholder="Search by name, ID, phone or email..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="[&>input]:h-9 [&>input]:py-1 [&>input]:text-xs [&>input]:pl-9 [&>input]:min-w-0 w-full"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={cn("h-9 gap-2 shrink-0 text-xs", activeFilterCount > 0 && "border-primary bg-primary/10 text-primary hover:bg-primary/15")}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[9px]">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterStatus("all");
              setFilterCategory("all");
            }}
            className="h-9 gap-1 text-muted-foreground shrink-0 text-xs"
          >
            <X className="w-3 h-3" /> <span className="hidden sm:inline">Clear</span>
          </Button>
        )}

        {/* View Toggle */}
        <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border/50 shrink-0">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 w-7 p-0 rounded-md"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 w-7 p-0 rounded-md"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-10 w-full text-xs font-semibold rounded-xl border border-border bg-muted/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-10 w-full text-xs font-semibold rounded-xl border border-border bg-muted/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="clinic_staff">Clinic Staff</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="complimentary">Complimentary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
