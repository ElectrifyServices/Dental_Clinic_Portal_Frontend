// ─── Corporate Plan Types ────────────────────────────────────────────────────
export type PlanCategory = 'corporate' | 'individual';
export type CoverageType = 'self' | 'family';

export interface PlanDependent {
  id: string;
  memberId: string;           // FK → CorporateEmployee.id
  name: string;
  relationship: string;       // e.g. 'Spouse', 'Child', 'Parent' — free text
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  isActive?: boolean;
  patientId?: string;         // set when this dependent registers as a patient
  corporatePlanId?: string;   // copied from primary member at time of creation
  primaryMemberName?: string; // copied from primary member at time of creation
}

export type PlanBenefitType =
  | 'flat_discount'            // X% off all services
  | 'treatment_discount'       // X% off specific treatments
  | 'free_consultations'       // N free consultations/year
  | 'free_treatments'          // N free specific treatments
  | 'capped_discount'          // X% off, max ₹Y per visit
  | 'unlimited_consultations'  // Unlimited check-ups/consultations for 1 year
  | 'complimentary_session'    // One-time complimentary session (e.g. cleaning + whitening)
  | 'priority_scheduling'      // Priority appointment scheduling (no numeric value)
  | 'fluoride_application'     // Fluoride application for kids, as needed (no numeric value)
  | 'custom';                  // Manually defined benefit

export interface PlanBenefit {
  id: string;
  type: PlanBenefitType;
  value: number;
  cap?: number;
  customName?: string;
  treatmentTypes?: string[];
  customTreatmentText?: string;
  description: string;
}

export type CorporatePlanTier = 'platinum' | 'gold' | 'silver' | 'premium' | 'standard' | 'basic';

export interface CorporatePlan {
  id: string;
  name: string;
  companyName: string;
  code: string;
  description: string;
  benefits: PlanBenefit[];
  validFrom: string;
  validTo: string;
  maxMembers?: number;
  currentMembers: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  color: string;
  status?: string;
  planCategory?: PlanCategory;  // 'corporate' (default) | 'individual'
  planType?: string;
  annualFee?: number;            // for individual plans (e.g. 1000)
  maxDependents?: number;        // 0 = self only; admin configures per plan
  planTier?: CorporatePlanTier;
}
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'doctor' | 'receptionist' | 'assistant';
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
  timeSlots?: { duration: number; bufferTime: number; };
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
  category?: 'regular' | 'family' | 'staff' | 'vip' | 'complimentary' | 'corporate';
  defaultDiscount?: number;
  avatar?: string;
  // Corporate plan fields
  corporatePlanId?: string;
  corporatePlanName?: string;
  corporateMemberId?: string;
  planEnrolledAt?: string;
  primaryMemberId?: string;      // CorporateEmployee.id when this patient is a dependent
  // Legacy field kept for compatibility
  companyId?: string;
  barcode?: string;
  isPerson?: boolean;
  registeredDate?: string;
  patient_code?: string;
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
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'checked-in';
  treatment?: string;
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
  isBilled?: boolean;
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
  // Corporate plan billing fields
  corporatePlanId?: string;
  corporatePlanName?: string;
  planDiscountApplied?: number;
  planBenefitsUsed?: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type LabWorkStatus = 'ordered' | 'received' | 'paid' | 'cancelled';

export interface LabWorkAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
}

export interface LabWork {
  id: string;
  patientId: string;
  patientName: string;
  treatmentId: string;
  treatmentName?: string;
  labName: string;
  workType: string;
  unitsCount: number;
  hasWarranty: boolean;
  warrantyYears?: number;
  warrantyEndDate?: string;
  createdDate: string;
  price: number;
  notes?: string;
  attachments?: LabWorkAttachment[];
  status: LabWorkStatus;
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
  dateRange: { start: string; end: string; };
  data: any;
  generatedAt: string;
  generatedBy: string;
}

// ─── Corporate Employee ───────────────────────────────────────────────────────
export interface CorporateEmployee {
  id: string;
  employeeId: string;          // company-issued ID
  name: string;
  phone: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  designation?: string;
  department?: string;
  companyName: string;
  corporatePlanId: string;     // which plan they are on
  corporatePlanName: string;
  enrolledAt: string;
  eligible_date?: string;
  isActive: boolean;
  status?: string;
  patientId?: string;          // linked patient record if registered
  coverageType?: CoverageType; // 'self' | 'family'
  dependents?: PlanDependent[];
}

export * from "./consultationTypes";
