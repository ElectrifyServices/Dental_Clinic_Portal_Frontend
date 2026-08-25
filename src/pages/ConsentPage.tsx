import { useState, useEffect, useMemo } from "react";
import { Loading } from "@/components/ui/Loading";
import { useModal } from "../contexts/ModalContext";
import { ConsentFormList } from "../components/Consent/ConsentFormList";
import { useConsentFormsQuery } from "../hooks/patients/useConsentFormsQuery";
import { useDeleteConsentFormMutation } from "../hooks/patients/useDeleteConsentFormMutation";
import { useDebounce } from "../hooks/useDebounce";
import { useDoctorsListQuery } from "../hooks/staff/useDoctorsListQuery";

export function ConsentPage() {
  const { setActiveModal, setSelectedConsentForm, confirmDelete, showToast } = useModal();
  const { doctors: apiDoctors } = useDoctorsListQuery();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: consentFormsData, isLoading, refetch } = useConsentFormsQuery({
    page,
    limit,
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
  const raw = consentFormsData as any;
  if (raw) {
    if (Array.isArray(raw)) {
      consentFormsList = raw;
    } else if (Array.isArray(raw.responseObject?.data?.data)) {
      consentFormsList = raw.responseObject.data.data;
    } else if (Array.isArray(raw.responseObject?.data)) {
      consentFormsList = raw.responseObject.data;
    } else if (Array.isArray(raw.data?.data)) {
      consentFormsList = raw.data.data;
    } else if (Array.isArray(raw.data)) {
      consentFormsList = raw.data;
    }
  }

  const mappedForms = consentFormsList.map((form: any) => {
    const patientIdStr = form.patient?.id || form.patient_id;
    return {
      id: form.id,
      patientName: form.patient?.name || form.patient_name || "Unknown",
      patientId: patientIdStr || "",
      patientCode: form.patient?.patient_code || form.patient?.patientCode || form.patient_code || "",
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
      doctorName: form.doctor_name || "Attending Dentist",
      status: !form.signed_on ? "PENDING" : (form.status || "PENDING"),
    };
  });

  const pagination = useMemo(() => {
    if (!raw) return null;
    return (
      raw.responseObject?.data?.pagination ||
      raw.data?.pagination ||
      raw.responseObject?.pagination ||
      raw.pagination
    );
  }, [raw]);

  const totalItems = pagination?.total ?? pagination?.total_items ?? mappedForms.length;
  const totalPages = pagination?.totalPages ?? pagination?.total_pages ?? Math.max(1, Math.ceil(mappedForms.length / limit));

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
        page={page}
        limit={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPerPageChange={setLimit}
        isLoading={isLoading}
      />
    </div>
  );
}
