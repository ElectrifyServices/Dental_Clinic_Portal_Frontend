import React, { createContext, useContext, useState, useCallback } from 'react';
import { doctorsWithSchedules } from '../data/doctors';

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

  deleteConfig: any;
  setDeleteConfig: React.Dispatch<React.SetStateAction<any>>;
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
  const [toast, setToast] = useState<any>(null);
  const [deleteConfig, setDeleteConfig] = useState<any>({
    show: false, title: '', message: '', onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const confirmDelete = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setDeleteConfig({
        show: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setDeleteConfig((prev: any) => ({ ...prev, show: false }));
          showToast('Record deleted successfully!', 'error');
        },
      });
    },
    [showToast]
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
        toast, showToast,
        deleteConfig, setDeleteConfig, confirmDelete,
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
