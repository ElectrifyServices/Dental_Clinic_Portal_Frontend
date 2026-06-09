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

export const demoCorporatePlans = [];
