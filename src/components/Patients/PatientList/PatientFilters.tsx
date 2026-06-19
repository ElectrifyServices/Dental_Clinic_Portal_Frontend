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
    <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm mb-6">
      <div className="w-full xl:flex-1">
        <SearchInput
          placeholder="Search by name, ID, phone or email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="h-11 px-4 border border-border rounded-xl text-sm font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-[160px] text-left flex items-center justify-between">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="h-11 px-4 border border-border rounded-xl text-sm font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-[160px] text-left flex items-center justify-between">
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

        <div className="h-8 w-px bg-border hidden xl:block" />

        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border/50 shrink-0">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={onAddPatient}
            className="gap-2 h-11 px-6 shadow-lg shadow-primary/10 flex-1 sm:flex-initial justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Button>
        </div>
      </div>
    </div>
  );
};
