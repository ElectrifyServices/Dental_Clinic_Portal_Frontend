import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/Loading";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { ConsentFormList } from "../components/Consent/ConsentFormList";
import { useConsentFormsQuery } from "../hooks/patients/useConsentFormsQuery";
import { useDeleteConsentFormMutation } from "../hooks/patients/useDeleteConsentFormMutation";
import { useDebounce } from "../hooks/useDebounce";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";

export function ConsentPage() {
  const { staffMembers } = useAppData();
  const { setActiveModal, setSelectedConsentForm, confirmDelete, showToast } = useModal();
  const { doctors: apiDoctors } = useDoctorsListQuery();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [filters, setFilters] = useState({
    status: "All",
    procedure: "All",
    doctor: "All",
    date: "All"
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const { data: consentFormsData, isLoading, refetch } = useConsentFormsQuery({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
    filters: {
      status: filters.status !== "All" ? [filters.status] : undefined,
      procedure_type: filters.procedure !== "All" ? [filters.procedure] : undefined,
      doctor_id: filters.doctor !== "All" ? [filters.doctor] : undefined,
      date_range: filters.date !== "All" ? filters.date : undefined,
    }
  });

  useEffect(() => {
    refetch();
  }, []);

  const deleteMutation = useDeleteConsentFormMutation();

  let consentFormsList: any[] = [];
  if (Array.isArray(consentFormsData)) {
    consentFormsList = consentFormsData;
  } else if (consentFormsData && Array.isArray((consentFormsData as any).data)) {
    consentFormsList = (consentFormsData as any).data;
  } else if (consentFormsData && (consentFormsData as any).responseObject?.data && Array.isArray((consentFormsData as any).responseObject.data)) {
    consentFormsList = (consentFormsData as any).responseObject.data;
  } else if (consentFormsData && (consentFormsData as any).data?.data && Array.isArray((consentFormsData as any).data.data)) {
    consentFormsList = (consentFormsData as any).data.data;
  }

  const mappedForms = consentFormsList.map((form: any) => {
    // Attempt to map doctor name
    const doctorObj = staffMembers.find((s: any) => s.id === form.doctor_id);
    return {
      id: form.id,
      patientName: form.patient_name || "Unknown",
      patientId: form.patient_id || "",
      treatmentType: form.procedure_type || "",
      createdDate: form.created_at || new Date().toISOString(),
      signedDate: form.signed_on || null,
      date: form.created_at || new Date().toISOString(), // Fallback
      signature: form.patient_signature || "",
      // details for viewer
      content: form.consent_declaration || "",
      riskDisclosure: form.clinical_risks || "",
      alternativeTreatments: form.alternative_risks || "",
      witnessName: form.witness_name || "",
      witnessSignature: form.witness_signature || "",
      doctorName: form.doctor_name || doctorObj?.name || "Attending Dentist",
      status: !form.signed_on ? "PENDING" : (form.status || "PENDING"),
    };
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      showToast("Consent form deleted successfully");
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete consent form", "error");
    }
  };

  return (
    <div className="space-y-3">
      {isLoading && !search ? (
        <Loading text="Fetching consent documents..." />
      ) : (
        <ConsentFormList
          forms={mappedForms}
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          doctorsList={apiDoctors || []}
          onAddForm={() => setActiveModal("consentForm")}
          onViewForm={(id: string) => {
            const f = mappedForms.find((x: any) => x.id === id);
            if (f) {
              setSelectedConsentForm(f);
              setActiveModal("consentViewer");
            }
          }}
          onEditForm={(id: string) => {
            const f = mappedForms.find((x: any) => x.id === id);
            if (f) {
              setSelectedConsentForm(f);
              setActiveModal("consentForm");
            }
          }}
          onDeleteForm={(id: string) =>
            confirmDelete(
              "Delete Consent Form",
              "Delete this consent form?",
              () => handleDelete(id),
            )
          }
        />
      )}
    </div>
  );
}
