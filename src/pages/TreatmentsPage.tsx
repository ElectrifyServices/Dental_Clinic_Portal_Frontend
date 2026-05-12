import React from "react";
import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { TreatmentList } from "../components/Treatments/TreatmentList";

export const TreatmentsPage: React.FC = () => {
  const { treatments, handleSaveTreatment } = useAppData();
  const { setActiveModal, setSelectedItemId, showToast } = useModal();

  return (
    <div className="space-y-6">
      <TreatmentList
        treatments={treatments}
        onAddTreatment={() => { setSelectedItemId(""); setActiveModal("treatmentForm"); }}
        onViewTreatment={(id: string) => { setSelectedItemId(id); setActiveModal("treatmentViewer"); }}
        onEditTreatment={(id: string) => { setSelectedItemId(id); setActiveModal("treatmentForm"); }}
        onManageSessions={(id: string) => { setSelectedItemId(id); setActiveModal("sessionManager"); }}
        onMarkCompleted={(id: string) => {
          const t = treatments.find((x: any) => x.id === id);
          if (t) { handleSaveTreatment({ ...t, status: "completed" }); showToast("Treatment completed!"); }
        }}
        onStartTreatment={(id: string) => {
          const t = treatments.find((x: any) => x.id === id);
          if (t) { handleSaveTreatment({ ...t, status: "in-progress" }); showToast("Treatment started!"); }
        }}
      />
    </div>
  );
};
