import React from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button, SearchInput } from "@/components/ui";

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
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm mb-6">
      <div className="flex-1">
        <SearchInput
          placeholder="Search by name, ID, phone or email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-11 px-4 border border-border rounded-xl text-sm font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new">New</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-11 px-4 border border-border rounded-xl text-sm font-bold bg-muted/50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="regular">Regular</option>
          <option value="family">Family</option>
          <option value="staff">Staff</option>
          <option value="corporate">Corporate</option>
        </select>

        <div className="h-8 w-px bg-border hidden lg:block" />

        <div className="flex items-center bg-muted p-1 rounded-xl border border-border/50">
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
          className="gap-2 h-11 px-6 shadow-lg shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>
    </div>
  );
};
