import { useStaffData } from "../hooks/useStaffData";
import { useModal } from "../contexts/ModalContext";
import { EMRList } from "../components/EMR/EMRList";
import { generateEMRPDF } from "../components/EMR/EMRViewer";
import { useEMRListQuery } from "../hooks/emr/useEMRListQuery";
import { useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

export function MedicalRecordsPage() {
  const { staffMembers } = useStaffData();
  const { setActiveModal, setSelectedEMRRecord, showToast } = useModal();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const debouncedSearch = useDebounce(search, 500);

  const queryParams: any = { page: 1, limit: 1000 };
  if (debouncedSearch) {
    queryParams.search = debouncedSearch;
  }
  if (typeFilter && typeFilter !== "all") {
    queryParams.filters = {
      record_type: [typeFilter.toUpperCase()],
    };
  }

  const { data: rawEmrData } = useEMRListQuery(queryParams, { refetchOnMount: "always" });

  const emrRecords = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(rawEmrData)) {
      rawList = rawEmrData;
    } else if (rawEmrData && Array.isArray((rawEmrData as any).data?.data)) {
      rawList = (rawEmrData as any).data.data;
    } else if (rawEmrData && Array.isArray((rawEmrData as any).data)) {
      rawList = (rawEmrData as any).data;
    } else if (rawEmrData && Array.isArray((rawEmrData as any).responseObject?.data)) {
      rawList = (rawEmrData as any).responseObject.data;
    } else if (rawEmrData && Array.isArray((rawEmrData as any).responseObject)) {
      rawList = (rawEmrData as any).responseObject;
    }

    // Group rawList by patient_id
    const groups: { [key: string]: any[] } = {};
    rawList.forEach((r: any) => {
      const patientId = r.patient_id || r.patient?.id || "unknown";
      if (!groups[patientId]) {
        groups[patientId] = [];
      }
      groups[patientId].push(r);
    });

    return Object.keys(groups).map((patientId) => {
      const groupRecords = groups[patientId];
      // Sort records by created_at descending to find the latest
      groupRecords.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      const latestRecord = groupRecords[0];

      // Format last visit date
      let lastVisitDate = "-";
      if (latestRecord.created_at) {
        const dateObj = new Date(latestRecord.created_at);
        if (!isNaN(dateObj.getTime())) {
          const day = dateObj.getDate().toString().padStart(2, '0');
          const month = dateObj.toLocaleDateString('en-GB', { month: 'short' });
          const year = dateObj.getFullYear();
          lastVisitDate = `${day} ${month} ${year}`;
        }
      }

      // Resolve last doctor
      let lastDoctorName = "-";
      if (latestRecord.created_by) {
        const staff = staffMembers?.find((s: any) => s.id === latestRecord.created_by);
        if (staff) {
          const isDoctor = staff.role === "doctor" || staff.originalRoleName?.toLowerCase().includes("doctor");
          const startsWithDr = staff.name?.toLowerCase().startsWith("dr") || staff.name?.toLowerCase().startsWith("dr.");
          lastDoctorName = (isDoctor && !startsWithDr) ? `Dr ${staff.name}` : staff.name;
        }
      }

      const patientName = latestRecord.patient?.name || "-";

      // Format latest record type
      const latestRecordTypeFormatted = latestRecord.record_type
        ? latestRecord.record_type.toLowerCase().replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        : "-";

      return {
        id: latestRecord.id,
        patientId: patientId,
        patientName: patientName,
        latestRecordTitle: latestRecordTypeFormatted,
        totalRecords: groupRecords.length,
        lastDoctorName: lastDoctorName,
        lastVisitDate: lastVisitDate,
        // Compatibility props for EMRList and EMRViewer
        date: latestRecord.created_at || new Date().toISOString(),
        type: (latestRecord.record_type || "consultation").toLowerCase(),
        title: latestRecord.title || "-",
        content: latestRecord.content || "-",
        doctorName: lastDoctorName,
        attachments: Array.isArray(latestRecord.attachments)
          ? latestRecord.attachments.map((file: any) => typeof file === "string" ? file : file.file_url || file.url)
          : [],
        timeline: groupRecords.map((r: any) => {
          let formattedItemDate = r.created_at || new Date().toISOString();
          let itemDoctor = "-";
          if (r.created_by) {
            const staff = staffMembers?.find((s: any) => s.id === r.created_by);
            if (staff) {
              const isDoctor = staff.role === "doctor" || staff.originalRoleName?.toLowerCase().includes("doctor");
              const startsWithDr = staff.name?.toLowerCase().startsWith("dr") || staff.name?.toLowerCase().startsWith("dr.");
              itemDoctor = (isDoctor && !startsWithDr) ? `Dr ${staff.name}` : staff.name;
            }
          }
          return {
            id: r.id,
            title: r.title || "-",
            content: r.content || "-",
            date: formattedItemDate,
            category: (r.record_type || "consultation").toLowerCase(),
            doctorName: itemDoctor,
            attachments: Array.isArray(r.attachments)
              ? r.attachments.map((file: any) => typeof file === "string" ? file : file.file_url || file.url)
              : []
          };
        })
      };
    });
  }, [rawEmrData, staffMembers]);

  const onAddRecord = () => setActiveModal("emrForm");
  const onViewRecord = (r: any) => {
    setSelectedEMRRecord(r);
    setActiveModal("emrViewer");
  };
  const onExportRecord = async (r: any) => {
    const timeline = r.timeline || [];
    await generateEMRPDF(r.patientName || "Patient", timeline, r.type);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <EMRList
        records={emrRecords}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onAddRecord={onAddRecord}
        onViewRecord={onViewRecord}
        onExportRecord={onExportRecord}
      />
    </div>
  );
}
