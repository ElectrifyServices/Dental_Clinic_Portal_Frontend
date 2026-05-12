import { doctorsWithSchedules } from './doctors';

export const demoStaff = [
  ...doctorsWithSchedules.map(d => ({
    ...d,
    role: d.id === '1' ? 'admin' : 'doctor',
    email: `${d.name.split(' ')[1].toLowerCase()}@clinic.com`,
    phone: `+91 ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
    permissions: d.id === '1' ? ['all'] : ['appointments', 'patients', 'treatments', 'emr'],
    isActive: true,
    avatar: d.image,
    salaryPaid: '15,000',
    salaryPending: '15,000',
  })),
  {
    id: '4', name: 'Sarah Johnson', email: 'sarah@clinic.com', role: 'receptionist',
    phone: '+91 65432 10987', permissions: ['appointments', 'patients'], isActive: true,
    salaryPaid: '12,000', salaryPending: '8,000',
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      saturday: { isWorking: true, startTime: '08:00', endTime: '14:00' },
      sunday: { isWorking: false, startTime: '08:00', endTime: '17:00' },
    },
  },
  {
    id: '5', name: 'Michael Chen', email: 'michael@clinic.com', role: 'assistant',
    specialization: 'Dental Assistant', phone: '+91 54321 09876',
    permissions: ['appointments', 'patients', 'inventory'], isActive: false,
    salaryPaid: '10,000', salaryPending: '5,000',
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      saturday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
      sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
    },
  },
];

export const demoInventory = [
  { id: '1', name: 'Dental Syringes', category: 'instruments', currentStock: 25, minStock: 10, unit: 'pieces', supplier: 'DentalCorp', lastRestocked: '2024-01-10', cost: 150 },
  { id: '2', name: 'Composite Filling Material', category: 'materials', currentStock: 5, minStock: 8, unit: 'tubes', supplier: 'MedSupply', lastRestocked: '2024-01-05', cost: 2500 },
  { id: '3', name: 'Dental Gloves (Nitrile)', category: 'consumables', currentStock: 200, minStock: 50, unit: 'boxes', supplier: 'SafetyFirst', lastRestocked: '2024-01-12', cost: 800 },
  { id: '4', name: 'Local Anesthetic', category: 'medicines', currentStock: 3, minStock: 5, unit: 'vials', supplier: 'PharmaCare', lastRestocked: '2023-12-28', cost: 1200 },
  { id: '5', name: 'Dental X-Ray Films', category: 'consumables', currentStock: 50, minStock: 20, unit: 'sheets', supplier: 'ImageTech', lastRestocked: '2024-01-08', cost: 45 },
];

export const demoCorporatePlans = [
  {
    id: 'CORP-SAMPLE-1', name: 'Electrify Gold Health Plan', companyName: 'Tata Consultancy Services',
    code: 'Electrify-GOLD', description: 'Premium dental care for Electrify employees',
    benefits: [
      { id: 'b1', type: 'flat_discount', value: 20, description: '20% discount on all treatments' },
      { id: 'b2', type: 'free_consultations', value: 2, description: '2 free consultations per year' },
    ],
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    maxMembers: 500, currentMembers: 0, isActive: true,
    createdAt: new Date().toISOString(), createdBy: 'Super Admin', color: 'blue',
  },
  {
    id: 'CORP-SAMPLE-2', name: 'Infosys Silver Plan', companyName: 'Infosys Limited',
    code: 'INFO-SILV', description: 'Standard dental coverage for Infosys employees',
    benefits: [
      { id: 'b3', type: 'treatment_discount', value: 15, treatmentTypes: ['root-canal', 'crown', 'surgery'], description: '15% off major procedures' },
      { id: 'b4', type: 'capped_discount', value: 10, cap: 2000, description: '10% discount (max ₹2,000 per visit)' },
    ],
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    currentMembers: 0, isActive: true,
    createdAt: new Date().toISOString(), createdBy: 'Super Admin', color: 'emerald',
  },
];
