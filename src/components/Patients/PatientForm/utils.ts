export const generateBarcode = (patientId: string) => {
  return `*${patientId}*`; // Code 39 format
};

export const generatePatientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `PAT${timestamp}`;
};

export const calculateAge = (dob: string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const medicalConditions = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease', 'Asthma',
  'Arthritis', 'Osteoporosis', 'Thyroid Disorder', 'Kidney Disease', 'Liver Disease',
  'Cancer History', 'Blood Disorder', 'Epilepsy', 'Depression', 'Anxiety',
  'High Cholesterol', 'Stroke History', 'Allergic Rhinitis', 'COPD', 'Other'
];

export const commonAllergies = [
  'Penicillin', 'Latex', 'Iodine', 'Aspirin', 'Codeine', 'Local Anesthetics',
  'Sulfa Drugs', 'Tetracycline', 'Erythromycin', 'Nickel', 'Adhesive Tape',
  'Food Allergies', 'Seasonal Allergies', 'Other'
];
