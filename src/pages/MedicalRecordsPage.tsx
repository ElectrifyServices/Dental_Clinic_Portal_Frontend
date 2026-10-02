import { useStaffData } from "../hooks/useStaffData";
import { useModal } from "../contexts/ModalContext";
import { EMRList } from "../components/EMR/EMRList";
import { generateEMRPDF } from "../components/EMR/EMRViewer";
import { useEMRListQuery } from "../hooks/emr/useEMRListQuery";
import { useMemo, useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";

/**
 * The EMR list endpoint returns its rows under several different wrappers
 * (`data`, `data.data`, `responseObject`, …) and each row's fields are
 * snake_case or camelCase depending on the source, so rows are read loosely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmrRow = any;

/** Query parameters sent to the EMR list endpoint. */
interface EmrQueryParams {
  page: number;
  limit: number;
  search?: string;
  filters?: { record_type: string[] };
}

/** A staff member, narrowed to the fields this page reads. */
interface StaffRow {
  id: string;
  name?: string;
  role?: string;
  originalRoleName?: string;
}

export function MedicalRecordsPage() {
  const { staffMembers } = useStaffData();
  const { setActiveModal, setSelectedEMRRecord } = useModal();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebounce(search, 500);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  const queryParams: EmrQueryParams = { page, limit };
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
    let rawList: EmrRow[] = [];
    if (Array.isArray(rawEmrData)) {
      rawList = rawEmrData;
    } else if (rawEmrData && Array.isArray((rawEmrData as EmrRow).data?.data)) {
      rawList = (rawEmrData as EmrRow).data.data;
    } else if (rawEmrData && Array.isArray((rawEmrData as EmrRow).data)) {
      rawList = (rawEmrData as EmrRow).data;
    } else if (rawEmrData && Array.isArray((rawEmrData as EmrRow).responseObject?.data)) {
      rawList = (rawEmrData as EmrRow).responseObject.data;
    } else if (rawEmrData && Array.isArray((rawEmrData as EmrRow).responseObject)) {
      rawList = (rawEmrData as EmrRow).responseObject;
    }

    // Group rawList by patient_id
    const groups: { [key: string]: EmrRow[] } = {};
    rawList.forEach((r: EmrRow) => {
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
        const staff = staffMembers?.find((s: StaffRow) => s.id === latestRecord.created_by);
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
          ? latestRecord.attachments.map((file: EmrRow) => typeof file === "string" ? file : file.file_url || file.url)
          : [],
        timeline: groupRecords.map((r: EmrRow) => {
          const formattedItemDate = r.created_at || new Date().toISOString();
          let itemDoctor = "-";
          if (r.created_by) {
            const staff = staffMembers?.find((s: StaffRow) => s.id === r.created_by);
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
              ? r.attachments.map((file: EmrRow) => typeof file === "string" ? file : file.file_url || file.url)
              : []
          };
        })
      };
    });
  }, [rawEmrData, staffMembers]);

  const totalItems = useMemo(() => {
    return (
      (rawEmrData as EmrRow)?.pagination?.total ||
      (rawEmrData as EmrRow)?.pagination?.total_items ||
      (rawEmrData as EmrRow)?.data?.pagination?.total ||
      (rawEmrData as EmrRow)?.data?.pagination?.total_items ||
      (rawEmrData as EmrRow)?.responseObject?.data?.pagination?.total ||
      (rawEmrData as EmrRow)?.responseObject?.data?.pagination?.total_items ||
      (rawEmrData as EmrRow)?.total ||
      (rawEmrData as EmrRow)?.total_elements ||
      (rawEmrData as EmrRow)?.totalElements ||
      (rawEmrData as EmrRow)?.count ||
      emrRecords.length ||
      0
    );
  }, [rawEmrData, emrRecords]);

  const totalPages = useMemo(() => {
    return (
      (rawEmrData as EmrRow)?.pagination?.totalPages ||
      (rawEmrData as EmrRow)?.pagination?.total_pages ||
      (rawEmrData as EmrRow)?.data?.pagination?.totalPages ||
      (rawEmrData as EmrRow)?.data?.pagination?.total_pages ||
      (rawEmrData as EmrRow)?.responseObject?.data?.pagination?.totalPages ||
      (rawEmrData as EmrRow)?.responseObject?.data?.pagination?.total_pages ||
      (rawEmrData as EmrRow)?.totalPages ||
      (rawEmrData as EmrRow)?.total_pages ||
      Math.max(1, Math.ceil(totalItems / limit))
    );
  }, [rawEmrData, totalItems, limit]);

  const onAddRecord = () => setActiveModal("emrForm");
  const onViewRecord = (r: EmrRow) => {
    setSelectedEMRRecord(r);
    setActiveModal("emrViewer");
  };
  const onExportRecord = async (r: EmrRow) => {
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
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
}
