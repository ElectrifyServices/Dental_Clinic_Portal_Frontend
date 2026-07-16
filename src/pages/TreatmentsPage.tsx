import React from "react";
import { useModal } from "../contexts/ModalContext";
import { TreatmentList } from "../components/Treatments/TreatmentList";
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
    isInitialLoading,
    isTableFetching,
    isStatsLoading,
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

  const previousModalRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (selectedItemId) {
      fetchSingleTreatment(selectedItemId);
    } else {
      clearSelectedTreatment();
    }
  }, [selectedItemId, fetchSingleTreatment, clearSelectedTreatment]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  React.useEffect(() => {
    const previousModal = previousModalRef.current;
    const shouldRefreshAfterClose =
      (previousModal === "treatmentForm" ||
        previousModal === "sessionManager" ||
        previousModal === "treatmentViewer") &&
      activeModal === null;

    if (shouldRefreshAfterClose) {
      refetch();
    }

    previousModalRef.current = activeModal;
  }, [activeModal, refetch]);

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
    <div className="flex h-full min-h-0 flex-col gap-2">
      <TreatmentList
        treatments={treatments}
        totals={totals}
        isLoading={isInitialLoading}
        isTableFetching={isTableFetching}
        isStatsLoading={isStatsLoading}
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
        onStartTreatment={wrappedHandleStartTreatment}
      />
    </div>
  );
};
