import type { ApiAny } from "../types/api";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { doctorsWithSchedules } from '../data/doctors';
import { toast } from '../components/ui';

interface ModalContextType {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  selectedAppointment: ApiAny;
  setSelectedAppointment: (apt: ApiAny) => void;

  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;

  selectedItemId: string;
  setSelectedItemId: (id: string) => void;

  selectedEMRRecord: ApiAny;
  setSelectedEMRRecord: (record: ApiAny) => void;

  selectedConsentForm: ApiAny;
  setSelectedConsentForm: (form: ApiAny) => void;

  selectedStaffForSalary: ApiAny;
  setSelectedStaffForSalary: (staff: ApiAny) => void;

  selectedPatientForDiagnose: ApiAny;
  setSelectedPatientForDiagnose: (patient: ApiAny) => void;

  selectedItemForRestock: ApiAny;
  setSelectedItemForRestock: (item: ApiAny) => void;

  preFilledPatientData: ApiAny;
  setPreFilledPatientData: (data: ApiAny) => void;

  patientFormType: 'normal' | 'person';
  setPatientFormType: (type: 'normal' | 'person') => void;

  parentPatientId: string;
  setParentPatientId: (id: string) => void;

  pendingCheckInAppt: ApiAny;
  setPendingCheckInAppt: (appt: ApiAny) => void;

  isFollowUpBooking: boolean;
  setIsFollowUpBooking: (val: boolean) => void;

  bookedFollowUp: ApiAny;
  setBookedFollowUp: (followUp: ApiAny) => void;

  draftConsultations: Record<string, ApiAny>;
  setDraftConsultations: React.Dispatch<React.SetStateAction<Record<string, ApiAny>>>;
  handleDraftUpdate: (patientId: string, data: ApiAny) => void;

  doctorAvailability: Record<string, boolean>;
  setDoctorAvailability: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  whatsappPhone: string | null;
  setWhatsappPhone: (phone: string | null) => void;
  whatsappPatientName: string | null;
  setWhatsappPatientName: (name: string | null) => void;

  toast: ApiAny;
  showToast: (message: string, type?: 'success' | 'error') => void;

  confirmConfig: ApiAny;
  setConfirmConfig: React.Dispatch<React.SetStateAction<ApiAny>>;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, variant?: string, toastMessage?: string) => void;
  confirmDelete: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ApiAny>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedEMRRecord, setSelectedEMRRecord] = useState<ApiAny>(null);
  const [selectedConsentForm, setSelectedConsentForm] = useState<ApiAny>(null);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<ApiAny>(null);
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] = useState<ApiAny>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<ApiAny>(null);
  const [preFilledPatientData, setPreFilledPatientData] = useState<ApiAny>(null);
  const [patientFormType, setPatientFormType] = useState<'normal' | 'person'>('normal');
  const [parentPatientId, setParentPatientId] = useState('');
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<ApiAny>(null);
  const [isFollowUpBooking, setIsFollowUpBooking] = useState(false);
  const [bookedFollowUp, setBookedFollowUp] = useState<ApiAny>(null);
  const [draftConsultations, setDraftConsultations] = useState<Record<string, ApiAny>>({});
  const [doctorAvailability, setDoctorAvailability] = useState<Record<string, boolean>>(
    doctorsWithSchedules.reduce((acc, d) => ({ ...acc, [d.id]: d.isAvailableToday }), {})
  );
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);
  const [whatsappPatientName, setWhatsappPatientName] = useState<string | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<ApiAny>({
    show: false, title: '', message: '', onConfirm: () => {}, confirmLabel: 'Confirm', variant: 'primary', toastMessage: '', isLoading: false
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, []);

  const showConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void | Promise<void>, confirmLabel = 'Confirm', variant = 'primary', toastMessage?: string) => {
      setConfirmConfig({
        show: true,
        title,
        message,
        confirmLabel,
        variant,
        isLoading: false,
        onConfirm: async () => {
          setConfirmConfig((prev: ApiAny) => ({ ...prev, isLoading: true }));
          try {
            await onConfirm();
            setConfirmConfig((prev: ApiAny) => ({ ...prev, show: false, isLoading: false }));
            if (toastMessage) {
              showToast(toastMessage, 'success');
            }
          } catch (error: ApiAny) {
            setConfirmConfig((prev: ApiAny) => ({ ...prev, show: false, isLoading: false }));
            const apiError = 
              error?.response?.data?.message || 
              error?.response?.data?.responseStatusList?.statusList?.[0]?.statusDesc ||
              error?.status?.statusDesc || 
              error?.response?.data?.status?.statusDesc || 
              error?.message || 
              "Failed to complete action";
            showToast(apiError, 'error');
          }
        },
      });
    },
    [showToast]
  );

  const confirmDelete = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      showConfirm(title, message, onConfirm, 'Delete', 'danger', 'Record deleted successfully!');
    },
    [showConfirm]
  );

  const handleDraftUpdate = useCallback((patientId: string, data: ApiAny) => {
    setDraftConsultations(prev => {
      if (JSON.stringify(prev[patientId]) === JSON.stringify(data)) return prev;
      return { ...prev, [patientId]: data };
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{
        activeModal, setActiveModal,
        selectedAppointment, setSelectedAppointment,
        selectedPatientId, setSelectedPatientId,
        selectedItemId, setSelectedItemId,
        selectedEMRRecord, setSelectedEMRRecord,
        selectedConsentForm, setSelectedConsentForm,
        selectedStaffForSalary, setSelectedStaffForSalary,
        selectedPatientForDiagnose, setSelectedPatientForDiagnose,
        selectedItemForRestock, setSelectedItemForRestock,
        preFilledPatientData, setPreFilledPatientData,
        patientFormType, setPatientFormType,
        parentPatientId, setParentPatientId,
        pendingCheckInAppt, setPendingCheckInAppt,
        isFollowUpBooking, setIsFollowUpBooking,
        bookedFollowUp, setBookedFollowUp,
        draftConsultations, setDraftConsultations, handleDraftUpdate,
        doctorAvailability, setDoctorAvailability,
        whatsappPhone, setWhatsappPhone,
        whatsappPatientName, setWhatsappPatientName,
        toast: null, showToast,
        confirmConfig, setConfirmConfig, showConfirm, confirmDelete,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModal(): ModalContextType {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
