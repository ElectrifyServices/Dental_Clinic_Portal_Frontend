import { useState, useMemo } from "react";
import { User } from "lucide-react";
import { ConfirmModal } from "@/components/ui";
import { PatientStats } from "./PatientList/PatientStats";
import { PatientFilters } from "./PatientList/PatientFilters";
import { PatientCard } from "./PatientList/PatientCard";
import { PatientTable } from "./PatientList/PatientTable";
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
}: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        (patient.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone || "").includes(searchTerm) ||
        (patient.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient.id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || (patient.status || "active") === filterStatus;
      const matchesCategory =
        filterCategory === "all" ||
        (patient.category || "regular") === filterCategory;
      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [patients, searchTerm, filterStatus, filterCategory]);

  const printBarcode = (patient: Patient) => {
    const printContent = `
      <html>
        <head>
          <title>Patient Barcode - ${patient.name}</title>
          <style>
            body { font-family: sans-serif; margin: 20px; text-align: center; background: white; }
            .barcode-card { border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin: 20px auto; width: 300px; background: #f0f9ff; }
            .barcode { font-family: monospace; font-size: 24px; font-weight: bold; background: white; padding: 10px; border: 1px solid #ddd; margin: 15px 0; border-radius: 6px; }
            .patient-info { background: white; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <h2>🦷 DentalCare Pro</h2>
            <div class="barcode">${patient.barcode || "*" + patient.id + "*"}</div>
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
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
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
              onDelete={(id) =>
                setPatientToDelete(patients.find((p) => p.id === id) || null)
              }
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
          onDelete={(id) =>
            setPatientToDelete(patients.find((p) => p.id === id) || null)
          }
          onExport={(id) => onExportPatient?.(id)}
          onPrintBarcode={printBarcode}
        />
      )}

      {patientToDelete && (
        <ConfirmModal
          title="Delete Patient Record"
          message={`Are you sure you want to delete the record for ${patientToDelete.name}? This action cannot be undone.`}
          confirmLabel="Delete Permanently"
          onConfirm={() => {
            onDeletePatient(patientToDelete.id);
            setPatientToDelete(null);
          }}
          onCancel={() => setPatientToDelete(null)}
        />
      )}
    </div>
  );
}
