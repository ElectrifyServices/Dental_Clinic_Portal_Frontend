import React from "react";
import { useModal } from "../contexts/ModalContext";
import { TreatmentList } from "../components/Treatments/TreatmentList";
import { TreatmentForm } from "../components/Treatments/TreatmentForm";
import { TreatmentViewer } from "../components/Treatments/TreatmentViewer";
import { TreatmentSessionManager } from "../components/Treatments/TreatmentSessionManager";
import { useTreatmentData } from "../hooks/useTreatmentData";

export const TreatmentsPage: React.FC = () => {
  const {
    setActiveModal,
    setSelectedItemId,
    activeModal,
    selectedItemId,
    showToast,
  } = useModal();

  const {
    treatments,
    isLoading,
    totals,
    handleSaveTreatment,
    handleMarkCompleted,
    handleStartTreatment,
    handleParamsChange,
    currentPage,
    totalPages,
    totalItems,
    refetch,
    selectedTreatment,
    fetchSingleTreatment,
    clearSelectedTreatment,
  } = useTreatmentData();

  React.useEffect(() => {
    if (selectedItemId) {
      fetchSingleTreatment(selectedItemId);
    } else {
      clearSelectedTreatment();
    }
  }, [selectedItemId, fetchSingleTreatment, clearSelectedTreatment]);

  const wrappedHandleSaveTreatment = async (formData: any, sessions: any[]) => {
    try {
      await handleSaveTreatment({ ...formData, sessions });
      setActiveModal(null);
      showToast("Treatment plan saved successfully!");
      refetch();
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? "Failed to save treatment plan",
        "error",
      );
    }
  };

  const wrappedHandleMarkCompleted = async (id: string) => {
    try {
      await handleMarkCompleted(id);
      showToast("Treatment marked as completed!");
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  const wrappedHandleStartTreatment = async (id: string) => {
    try {
      await handleStartTreatment(id);
      showToast("Treatment started!");
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Failed to update", "error");
    }
  };

  return (
    <div className="space-y-6">
      <TreatmentList
        treatments={treatments}
        totals={totals}
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onParamsChange={handleParamsChange}
        onAddTreatment={() => {
          setSelectedItemId("");
          setActiveModal("treatmentForm");
        }}
        onViewTreatment={(id: string) => {
          setSelectedItemId(id);
          setActiveModal("treatmentViewer");
        }}
        onEditTreatment={(id: string) => {
          setSelectedItemId(id);
          setActiveModal("treatmentForm");
        }}
        onManageSessions={(id: string) => {
          setSelectedItemId(id);
          setActiveModal("sessionManager");
        }}
        onMarkCompleted={wrappedHandleMarkCompleted}
        onStartTreatment={wrappedHandleStartTreatment}
      />

      {/* Create / Edit form */}
      {activeModal === "treatmentForm" && (!selectedItemId || selectedTreatment) && (
        <TreatmentForm
          treatment={selectedItemId ? selectedTreatment : undefined}
          patients={[]}
          doctors={[]}
          onClose={() => setActiveModal(null)}
          onSave={wrappedHandleSaveTreatment}
          isSaving={false}
        />
      )}

      {/* View modal */}
      {activeModal === "treatmentViewer" && selectedItemId && (
        <TreatmentViewer
          treatmentId={selectedItemId}
          onClose={() => setActiveModal(null)}
          onEditTreatment={(id) => {
            setSelectedItemId(id);
            setActiveModal("treatmentForm");
          }}
          onMarkCompleted={wrappedHandleMarkCompleted}
          onStartTreatment={wrappedHandleStartTreatment}
        />
      )}

      {/* Session manager */}
      {activeModal === "sessionManager" && selectedTreatment && (
        <TreatmentSessionManager
          treatmentId={selectedTreatment.id}
          patientName={selectedTreatment.patientName}
          procedure={selectedTreatment.procedure}
          sessions={selectedTreatment.sessions}
          onClose={() => setActiveModal(null)}
          onScheduleAppointment={() => {}}
          onUpdateSessions={() => {}}
        />
      )}
    </div>
  );
};