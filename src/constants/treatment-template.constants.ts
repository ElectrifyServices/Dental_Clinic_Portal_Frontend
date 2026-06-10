export interface SessionTemplate {
  name: string;
  duration: number;
  gap: number;
  description: string;
  isRequired: boolean;
}

export interface TreatmentTemplate {
  sessions: SessionTemplate[];
  totalCost: number;
}

export const treatmentTemplates: Record<string, TreatmentTemplate> = {
  "Root Canal Treatment": {
    sessions: [
      {
        name: "Initial Consultation & X-Ray",
        duration: 30,
        gap: 0,
        description: "Diagnosis and treatment planning",
        isRequired: true,
      },
      {
        name: "Pulp Removal & Cleaning",
        duration: 60,
        gap: 1,
        description: "Access cavity, pulp removal, canal cleaning",
        isRequired: true,
      },
      {
        name: "Canal Filling & Sealing",
        duration: 45,
        gap: 7,
        description: "Root canal filling and temporary crown",
        isRequired: true,
      },
      {
        name: "Crown Preparation",
        duration: 60,
        gap: 14,
        description: "Permanent crown fitting",
        isRequired: true,
      },
    ],
    totalCost: 8000,
  },
  "Regular Checkup": {
    sessions: [
      {
        name: "Oral Examination",
        duration: 30,
        gap: 0,
        description: "Complete oral health assessment",
        isRequired: true,
      },
    ],
    totalCost: 500,
  },
  "Teeth Cleaning & Scaling": {
    sessions: [
      {
        name: "Initial Assessment",
        duration: 15,
        gap: 0,
        description: "Oral health evaluation",
        isRequired: true,
      },
      {
        name: "Scaling & Cleaning",
        duration: 45,
        gap: 0,
        description: "Professional teeth cleaning",
        isRequired: true,
      },
      {
        name: "Fluoride Treatment",
        duration: 15,
        gap: 0,
        description: "Fluoride application",
        isRequired: false,
      },
    ],
    totalCost: 1500,
  },
  "Dental Filling": {
    sessions: [
      {
        name: "Cavity Assessment",
        duration: 20,
        gap: 0,
        description: "Examine and prepare cavity",
        isRequired: true,
      },
      {
        name: "Filling Procedure",
        duration: 45,
        gap: 0,
        description: "Remove decay and place filling",
        isRequired: true,
      },
    ],
    totalCost: 2000,
  },
  "Orthodontic Treatment": {
    sessions: [
      {
        name: "Initial Consultation",
        duration: 45,
        gap: 0,
        description: "Assessment and treatment planning",
        isRequired: true,
      },
      {
        name: "Braces Installation",
        duration: 90,
        gap: 7,
        description: "Bracket placement and wire installation",
        isRequired: true,
      },
      {
        name: "Monthly Adjustment 1",
        duration: 30,
        gap: 30,
        description: "Wire tightening and progress check",
        isRequired: true,
      },
      {
        name: "Monthly Adjustment 2",
        duration: 30,
        gap: 60,
        description: "Continued adjustment and monitoring",
        isRequired: true,
      },
      {
        name: "Monthly Adjustment 3",
        duration: 30,
        gap: 90,
        description: "Progress evaluation and adjustment",
        isRequired: true,
      },
    ],
    totalCost: 25000,
  },
  "Dental Implant": {
    sessions: [
      {
        name: "Pre-surgical Consultation",
        duration: 45,
        gap: 0,
        description: "CT scan and surgical planning",
        isRequired: true,
      },
      {
        name: "Implant Placement Surgery",
        duration: 120,
        gap: 7,
        description: "Surgical implant placement",
        isRequired: true,
      },
      {
        name: "Healing Check (2 weeks)",
        duration: 30,
        gap: 14,
        description: "Post-surgical healing assessment",
        isRequired: true,
      },
      {
        name: "Healing Check (6 weeks)",
        duration: 30,
        gap: 42,
        description: "Osseointegration progress check",
        isRequired: true,
      },
      {
        name: "Crown Placement",
        duration: 60,
        gap: 90,
        description: "Final crown attachment",
        isRequired: true,
      },
    ],
    totalCost: 35000,
  },
  "Crown Placement": {
    sessions: [
      {
        name: "Tooth Preparation",
        duration: 60,
        gap: 0,
        description: "Prepare tooth and take impressions",
        isRequired: true,
      },
      {
        name: "Temporary Crown Fitting",
        duration: 30,
        gap: 0,
        description: "Place temporary crown",
        isRequired: true,
      },
      {
        name: "Permanent Crown Placement",
        duration: 45,
        gap: 14,
        description: "Fit and cement permanent crown",
        isRequired: true,
      },
    ],
    totalCost: 8000,
  },
  "Tooth Extraction": {
    sessions: [
      {
        name: "Pre-extraction Assessment",
        duration: 20,
        gap: 0,
        description: "X-ray and extraction planning",
        isRequired: true,
      },
      {
        name: "Extraction Procedure",
        duration: 45,
        gap: 0,
        description: "Tooth extraction and suturing",
        isRequired: true,
      },
      {
        name: "Follow-up Check",
        duration: 15,
        gap: 7,
        description: "Healing assessment and suture removal",
        isRequired: false,
      },
    ],
    totalCost: 1000,
  },
};