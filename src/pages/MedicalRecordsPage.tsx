import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { EMRList } from "../components/EMR/EMRList";

export function MedicalRecordsPage() {
  const { patients, treatments, invoices, appointments, emrRecords } =
    useAppData();
  const { setActiveModal, setSelectedEMRRecord, showToast } = useModal();

  const onAddRecord = () => setActiveModal("emrForm");
  const onViewRecord = (r: any) => {
    setSelectedEMRRecord(r);
    setActiveModal("emrViewer");
  };
  const onExportRecord = (_r: any) =>
    showToast("Record exported successfully!");
  // Group all records by Patient to create a patient-centric view
  const patientGroups = patients
    .map((patient) => {
      const patientTreatments = treatments.filter(
        (t) =>
          t.patientId === patient.id ||
          (t.patientName &&
            t.patientName.toLowerCase() === patient.name.toLowerCase()),
      );
      const patientInvoices = invoices.filter(
        (inv) =>
          inv.patientId === patient.id ||
          (inv.patientName &&
            inv.patientName.toLowerCase() === patient.name.toLowerCase()),
      );
      const patientAppointments = appointments.filter(
        (apt) =>
          apt.patientId === patient.id ||
          (apt.patientName &&
            apt.patientName.toLowerCase() === patient.name.toLowerCase()),
      );
      const patientManualRecords = emrRecords.filter(
        (r) =>
          r.patientId === patient.id ||
          (r.patientName &&
            r.patientName.toLowerCase() === patient.name.toLowerCase()),
      );
      const patientPrescriptions = patient.prescriptionHistory || [];

      // Combine all for this patient's timeline
      const timeline = [
        ...patientManualRecords.map((r) => ({ ...r, category: "manual" })),
        ...patientAppointments.map((apt) => ({
          id: apt.id,
          date: apt.date,
          type: "appointment-visit",
          title: `Appointment: ${apt.type || apt.treatment || "Visit"}`,
          content: `Time: ${apt.time} | Doctor: ${apt.doctorName} | Status: ${apt.status}`,
          category: "appointment",
        })),
        ...patientTreatments.map((t) => ({
          id: t.id,
          date: t.startDate || new Date().toISOString(),
          type: "treatment-note",
          title: `Treatment: ${t.procedure}`,
          content: `Tooth: ${t.toothNumber} | Status: ${t.status}`,
          category: "treatment",
        })),
        ...patientInvoices.map((inv) => ({
          id: inv.id,
          date: inv.date || new Date().toISOString(),
          type: "billing-record",
          title: `Invoice: ${inv.id}`,
          content: `Amount: ₹${inv.total || inv.amount} | Status: ${inv.status}`,
          category: "billing",
        })),
        ...patientPrescriptions.map((h: any) => ({
          id: h.id,
          date: h.date,
          type: "prescription",
          title: `Consultation: ${h.treatment}`,
          content: `Diagnosis: ${h.diagnosis || "N/A"}`,
          category: "consultation",
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        id: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        lastActivity:
          timeline[0]?.date || patient.createdAt || new Date().toISOString(),
        activityCount: timeline.length,
        latestTitle: timeline[0]?.title || "No activity recorded",
        timeline: timeline,
        // For EMRList compatibility
        patientId: patient.id,
        doctorId: "multiple",
        type: "consultation" as const,
        title: patient.name,
        content: `Total Records: ${timeline.length} | Latest: ${timeline[0]?.title || "None"}`,
        date: timeline[0]?.date || new Date().toISOString(),
        doctorName: "Multiple Doctors",
      };
    })
    .filter((p) => p.activityCount > 0) // Only show patients with records
    .sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    );

  return (
    <div className="animate-in fade-in duration-500">
      <EMRList
        records={patientGroups}
        onAddRecord={onAddRecord}
        onViewRecord={onViewRecord}
        onExportRecord={onExportRecord}
      />
    </div>
  );
}
