export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'assistant';
  avatar?: string;
  permissions: string[];
  specialization?: string;
  phone?: string;
  isActive: boolean;
  workingHours?: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
      breakStart?: string;
      breakEnd?: string;
    };
  };
  timeSlots?: {
    duration: number; // in minutes
    bufferTime: number; // buffer between appointments
  };
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  createdAt: string;
  lastVisit?: string;
  totalVisits: number;
  outstandingBalance: number;
  status: 'active' | 'inactive' | 'new';
  category?: 'regular' | 'family' | 'staff' | 'vip' | 'complimentary';
  defaultDiscount?: number;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'cleaning' | 'filling' | 'extraction' | 'root-canal' | 'crown' | 'orthodontics' | 'surgery' | 'emergency' | 'other';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  fee: number;
  patientConcern: string;
  treatmentType: string;
  doctorId: string;
  doctorName: string;
  reminderSent: boolean;
}

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  procedure: string;
  tooth: string;
  notes: string;
  cost: number;
  status: 'planned' | 'in-progress' | 'completed';
  images?: string[];
  nextAppointment?: string;
  doctorId: string;
  doctorName: string;
  prescriptions?: Prescription[];
}

export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'complimentary';
  isComplimentary?: boolean;
  complimentaryNote?: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'razorpay' | 'bank-transfer';
  dueDate: string;
  paidDate?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'instruments' | 'materials' | 'consumables' | 'medicines';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  cost: number;
  expiryDate?: string;
  batchNumber?: string;
}

export interface EMRRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab-report' | 'x-ray' | 'treatment-note';
  title: string;
  content: string;
  attachments?: string[];
  doctorId: string;
  doctorName: string;
}

export interface ConsentForm {
  id: string;
  patientId: string;
  treatmentType: string;
  content: string;
  signature: string;
  date: string;
  witnessSignature?: string;
}

export interface DashboardStats {
  todayAppointments: number;
  todayEarnings: number;
  totalPatients: number;
  monthlyEarnings: number;
  pendingPayments: number;
  lowStockItems: number;
  completedTreatments: number;
  cancelledAppointments: number;
}

export interface Report {
  id: string;
  type: 'earnings' | 'patients' | 'appointments' | 'inventory' | 'treatments';
  title: string;
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
  generatedBy: string;
}