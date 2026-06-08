import React, { createContext, useContext, useState, useCallback } from 'react';
import { doctorsWithSchedules } from '../data/doctors';
import { toast } from '../components/ui';

interface ModalContextType {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  selectedAppointment: any;
  setSelectedAppointment: (apt: any) => void;

  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;

  selectedItemId: string;
  setSelectedItemId: (id: string) => void;

  selectedEMRRecord: any;
  setSelectedEMRRecord: (record: any) => void;

  selectedConsentForm: any;
  setSelectedConsentForm: (form: any) => void;

  selectedStaffForSalary: any;
  setSelectedStaffForSalary: (staff: any) => void;

  selectedPatientForDiagnose: any;
  setSelectedPatientForDiagnose: (patient: any) => void;

  selectedItemForRestock: any;
  setSelectedItemForRestock: (item: any) => void;

  preFilledPatientData: any;
  setPreFilledPatientData: (data: any) => void;

  patientFormType: 'normal' | 'person';
  setPatientFormType: (type: 'normal' | 'person') => void;

  parentPatientId: string;
  setParentPatientId: (id: string) => void;

  pendingCheckInAppt: any;
  setPendingCheckInAppt: (appt: any) => void;

  isFollowUpBooking: boolean;
  setIsFollowUpBooking: (val: boolean) => void;

  bookedFollowUp: any;
  setBookedFollowUp: (followUp: any) => void;

  draftConsultations: Record<string, any>;
  setDraftConsultations: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleDraftUpdate: (patientId: string, data: any) => void;

  doctorAvailability: Record<string, boolean>;
  setDoctorAvailability: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  toast: any;
  showToast: (message: string, type?: 'success' | 'error') => void;

  confirmConfig: any;
  setConfirmConfig: React.Dispatch<React.SetStateAction<any>>;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmLabel?: string, variant?: string, toastMessage?: string) => void;
  confirmDelete: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedEMRRecord, setSelectedEMRRecord] = useState<any>(null);
  const [selectedConsentForm, setSelectedConsentForm] = useState<any>(null);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<any>(null);
  const [selectedPatientForDiagnose, setSelectedPatientForDiagnose] = useState<any>(null);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState<any>(null);
  const [preFilledPatientData, setPreFilledPatientData] = useState<any>(null);
  const [patientFormType, setPatientFormType] = useState<'normal' | 'person'>('normal');
  const [parentPatientId, setParentPatientId] = useState('');
  const [pendingCheckInAppt, setPendingCheckInAppt] = useState<any>(null);
  const [isFollowUpBooking, setIsFollowUpBooking] = useState(false);
  const [bookedFollowUp, setBookedFollowUp] = useState<any>(null);
  const [draftConsultations, setDraftConsultations] = useState<Record<string, any>>({});
  const [doctorAvailability, setDoctorAvailability] = useState<Record<string, boolean>>(
    doctorsWithSchedules.reduce((acc, d) => ({ ...acc, [d.id]: d.isAvailableToday }), {})
  );
  const [confirmConfig, setConfirmConfig] = useState<any>({
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
          setConfirmConfig((prev: any) => ({ ...prev, isLoading: true }));
          try {
            await onConfirm();
            setConfirmConfig((prev: any) => ({ ...prev, show: false, isLoading: false }));
            if (toastMessage) {
              showToast(toastMessage, 'success');
            }
          } catch (error: any) {
            setConfirmConfig((prev: any) => ({ ...prev, show: false, isLoading: false }));
            const apiError = 
              error?.response?.data?.message || 
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

  const handleDraftUpdate = useCallback((patientId: string, data: any) => {
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
        toast: null, showToast,
        confirmConfig, setConfirmConfig, showConfirm, confirmDelete,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextType {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
