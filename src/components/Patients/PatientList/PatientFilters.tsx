import React from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

interface PatientFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (mode: "grid" | "table") => void;
  onAddPatient: () => void;
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
  onAddPatient,
}) => {
  return (
    <div className="flex flex-row items-center gap-2 bg-card p-2 rounded-2xl border border-border shadow-sm mb-6 w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0">
      {/* Search Input takes remaining space */}
      <div className="flex-grow min-w-[100px] max-w-md xl:max-w-xl min-w-0">
        <SearchInput
          placeholder="Search by name, ID, phone or email..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="[&>input]:h-9 [&>input]:py-1 [&>input]:text-xs [&>input]:pl-9 [&>input]:min-w-0 w-full"
        />
      </div>

      {/* Status Select */}
      <div className="shrink-0">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 px-2 border border-border rounded-xl text-xs font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-28 text-left flex items-center justify-between gap-1">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Select */}
      <div className="shrink-0">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 px-2 border border-border rounded-xl text-xs font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-32 text-left flex items-center justify-between gap-1">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="corporate">Membership</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="complimentary">Complimentary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border shrink-0" />

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

      {/* Add Button */}
      <Button
        onClick={onAddPatient}
        className="gap-1.5 h-9 px-3 shadow-lg shadow-primary/10 shrink-0 justify-center font-bold text-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Patient</span>
      </Button>
    </div>
  );
};
