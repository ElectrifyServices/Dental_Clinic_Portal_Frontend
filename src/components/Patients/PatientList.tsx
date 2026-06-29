import { useState, useMemo } from "react";
import { User } from "lucide-react";
import { ConfirmModal } from "@/components/ui";
import { PatientStats } from "./PatientList/PatientStats";
import { PatientFilters } from "./PatientList/PatientFilters";
import { PatientCard } from "./PatientList/PatientCard";
import { PatientTable } from "./PatientList/PatientTable";
import { Pagination } from "@/components/ui";
import { Patient } from "@/types";

interface PatientListProps {
  patients: Patient[];
  onAddPatient: (type?: string, patientId?: string) => void;
  onViewPatient: (patientId: string) => void;
  onEditPatient: (patientId: string) => void;
  onDeletePatient: (patientId: string) => void;
  onExportPatient?: (patientId: string) => void;
  onToggleStatus?: (id: string, newStatus: "active" | "inactive") => void;
  onToggleCategory?: (id: string, newCategory: string) => void;
  onShowCorporateManagement?: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (val: string) => void;
  filterCategory?: string;
  onFilterCategoryChange?: (val: string) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function PatientList({
  patients,
  onAddPatient,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
  onExportPatient,
  onToggleStatus,
  onToggleCategory,
  searchValue,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: PatientListProps) {
  const [localSearch, setLocalSearch] = useState("");
  const searchTerm = searchValue !== undefined ? searchValue : localSearch;
  const setSearchTerm = onSearchChange ?? setLocalSearch;

  const [localFilterStatus, setLocalFilterStatus] = useState("all");
  const filterStatusVal = filterStatus !== undefined ? filterStatus : localFilterStatus;
  const setFilterStatusVal = onFilterStatusChange ?? setLocalFilterStatus;

  const [localFilterCategory, setLocalFilterCategory] = useState("all");
  const filterCategoryVal = filterCategory !== undefined ? filterCategory : localFilterCategory;
  const setFilterCategoryVal = onFilterCategoryChange ?? setLocalFilterCategory;

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredPatients = useMemo(() => {
    // Client-side filtering as a robust dual-layer fallback
    return patients.filter((patient) => {
      const matchesSearch =
        (patient.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone || "").includes(searchTerm) ||
        (patient.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient.patient_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatusVal === "all" || (patient.status || "active").toLowerCase() === filterStatusVal.toLowerCase();
      const matchesCategory =
        filterCategoryVal === "all" ||
        (patient.category || "regular").toLowerCase() === filterCategoryVal.toLowerCase();
      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [patients, searchTerm, filterStatusVal, filterCategoryVal]);

  const printBarcode = (patient: Patient) => {
    const codeData = patient.barcode || patient.id || "0000";
    const printContent = `
      <html>
        <head>
          <title>Patient Barcode - ${patient.name}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; text-align: center; background: white; }
            .barcode-card { border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin: 20px auto; width: 320px; background: #f0f9ff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .barcode-img-container { background: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; border-radius: 6px; display: flex; justify-content: center; align-items: center; }
            .barcode-img { max-width: 100%; height: auto; }
            .barcode-text { font-family: monospace; font-size: 14px; font-weight: bold; color: #4b5563; margin-top: 5px; }
            .patient-info { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; border: 1px solid #e5e7eb; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px; font-weight: 600; color: #374151; }
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">🦷 Opal Smiles Dental Studio</h2>
            <div class="barcode-img-container">
              <div>
                <img class="barcode-img" src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(codeData)}&scale=2.5&rotate=N&includetext=false" alt="Barcode" />
                <div class="barcode-text">${codeData}</div>
              </div>
            </div>
            <div class="patient-info">
              <div class="info-row"><span>ID:</span><span>${patient.id}</span></div>
              <div class="info-row"><span>Name:</span><span>${patient.name}</span></div>
              <div class="info-row"><span>Status:</span><span>${(patient.status || "active").toUpperCase()}</span></div>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    if (onToggleStatus) {
      onToggleStatus(id, currentStatus === "active" ? "inactive" : "active");
    }
  };

  const handleToggleCategory = (id: string, currentCategory: string) => {
    if (onToggleCategory) {
      onToggleCategory(
        id,
        currentCategory === "regular" ? "premium" : "regular",
      );
    } else {
      // If parent doesn't provide a toggle, we can trigger the add-person-to-patient flow
      onAddPatient("person", id);
    }
  };

  return (
    <div className="space-y-6">
      <PatientStats patients={patients} />

      <PatientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatusVal}
        setFilterStatus={setFilterStatusVal}
        filterCategory={filterCategoryVal}
        setFilterCategory={setFilterCategoryVal}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddPatient={() => onAddPatient()}
      />

      {filteredPatients.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border py-20 text-center">
          <User className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">
            No patients found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={onViewPatient}
              onEdit={onEditPatient}
              onDelete={onDeletePatient}
              onExport={(id) => onExportPatient?.(id)}
              onPrintBarcode={printBarcode}
              onToggleStatus={handleToggleStatus}
              onToggleCategory={handleToggleCategory}
            />
          ))}
        </div>
      ) : (
        <PatientTable
          patients={filteredPatients}
          onView={onViewPatient}
          onEdit={onEditPatient}
          onDelete={onDeletePatient}
          onExport={(id) => onExportPatient?.(id)}
          onPrintBarcode={printBarcode}
          onToggleStatus={handleToggleStatus}
          onToggleCategory={handleToggleCategory}
        />
      )}

      {totalPages > 1 && onPageChange && (
        <div className="mt-6 flex justify-end">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={10}
            onPageChange={onPageChange}
          />
        </div>
      )}

    </div>
  );
}
