import type { ApiAny } from "../../../types/api";
import { useMedicalHistoriesQuery, useCreateMedicalHistoryMutation, useDeleteMedicalHistoryMutation } from '@/hooks/patients/useMedicalHistoriesQuery';
import { useAllergiesQuery, useCreateAllergyMutation, useDeleteAllergyMutation } from '@/hooks/patients/useAllergiesQuery';
import { useModal } from '@/contexts/ModalContext';
import { useMemo } from 'react';

interface UseStep2MedicalHistoryProps {
  selectedMedicalHistory: string[];
  setSelectedMedicalHistory: (val: string[]) => void;
  selectedAllergies: string[];
  setSelectedAllergies: (val: string[]) => void;
  setFormData: (updater: ApiAny) => void;
}

export function useStep2MedicalHistory({
  selectedMedicalHistory,
  setSelectedMedicalHistory,
  selectedAllergies,
  setSelectedAllergies,
  setFormData,
}: UseStep2MedicalHistoryProps) {
  const { data: apiMedicalHistories } = useMedicalHistoriesQuery({ enabled: true, staleTime: 0 });
  const createMedicalHistory = useCreateMedicalHistoryMutation();
  const deleteMedicalHistory = useDeleteMedicalHistoryMutation();
  const { confirmDelete } = useModal();

  const { data: apiAllergies } = useAllergiesQuery({ enabled: true, staleTime: 0 });
  const createAllergy = useCreateAllergyMutation();
  const deleteAllergy = useDeleteAllergyMutation();

  const medicalHistories = useMemo(() => {
    let rawList: ApiAny[] = [];
    if (Array.isArray(apiMedicalHistories)) {
      rawList = apiMedicalHistories;
    } else if (apiMedicalHistories && Array.isArray((apiMedicalHistories as ApiAny).all)) {
      rawList = (apiMedicalHistories as ApiAny).all;
    } else if (apiMedicalHistories && Array.isArray((apiMedicalHistories as ApiAny).data?.all)) {
      rawList = (apiMedicalHistories as ApiAny).data.all;
    } else if (apiMedicalHistories && Array.isArray((apiMedicalHistories as ApiAny).data)) {
      rawList = (apiMedicalHistories as ApiAny).data;
    }
    return rawList;
  }, [apiMedicalHistories]);

  const allergies = useMemo(() => {
    let rawList: ApiAny[] = [];
    if (Array.isArray(apiAllergies)) {
      rawList = apiAllergies;
    } else if (apiAllergies && Array.isArray((apiAllergies as ApiAny).all)) {
      rawList = (apiAllergies as ApiAny).all;
    } else if (apiAllergies && Array.isArray((apiAllergies as ApiAny).data?.all)) {
      rawList = (apiAllergies as ApiAny).data.all;
    } else if (apiAllergies && Array.isArray((apiAllergies as ApiAny).data)) {
      rawList = (apiAllergies as ApiAny).data;
    }
    return rawList;
  }, [apiAllergies]);

  const handleCreateMedicalHistory = async (val: string) => {
    const res = await createMedicalHistory.mutateAsync({ name: val, is_custom: true });
    const newId = res?.data?.id || res?.data?.medical_history_id || res?.id || res?.medical_history_id;
    if (newId) {
      return newId;
    }
    throw new Error("Failed to create medical condition");
  };

  const handleDeleteMedicalHistory = async (val: string) => {
    const item = medicalHistories.find((h: ApiAny) => (h.id || h.name) === val);
    if (item && item.id) {
      confirmDelete(
        "Delete Condition",
        `Are you sure you want to permanently delete "${item.name || val}"?`,
        async () => {
          await deleteMedicalHistory.mutateAsync(item.id);
          if (selectedMedicalHistory.includes(val)) {
            const updated = selectedMedicalHistory.filter((i) => i !== val);
            setSelectedMedicalHistory(updated);
            setFormData((prev: ApiAny) => ({ ...prev, medicalHistory: updated.join('\n') }));
          }
        }
      );
    }
  };

  const handleCreateAllergy = async (val: string) => {
    const res = await createAllergy.mutateAsync({ allergy_name: val, is_custom: true });
    const newId = res?.data?.id || res?.data?.allergy_id || res?.id || res?.allergy_id;
    if (newId) {
      return newId;
    }
    throw new Error("Failed to create allergy");
  };

  const handleDeleteAllergy = async (val: string) => {
    const item = allergies.find((a: ApiAny) => (a.id || a.allergy_name || a.name) === val);
    if (item && item.id) {
      confirmDelete(
        "Delete Allergy",
        `Are you sure you want to permanently delete "${item.allergy_name || item.name || val}"?`,
        async () => {
          await deleteAllergy.mutateAsync(item.id);
          if (selectedAllergies.includes(val)) {
            const updated = selectedAllergies.filter((i) => i !== val);
            setSelectedAllergies(updated);
            setFormData((prev: ApiAny) => ({ ...prev, allergies: updated.join('\n') }));
          }
        }
      );
    }
  };

  return {
    medicalHistories,
    allergies,
    handleCreateMedicalHistory,
    handleDeleteMedicalHistory,
    handleCreateAllergy,
    handleDeleteAllergy,
  };
}
