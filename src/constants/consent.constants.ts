export interface ConsentTemplate {
  description: string;
  consentDeclaration: string;
  risks: string[];
  alternatives: string[];
  responsibilities: string[];
}

// The 3 primary treatment consent types for checkbox selection
export const CONSENT_CHECKBOX_TREATMENTS = [
  {
    key: "Root Canal Treatment (Endodontics)",
    label: "Root Canal Treatment",
    subtitle: "Endodontics",
    description: "Removal of infected pulp tissue, root canal disinfection and sealing to preserve tooth function.",
    icon: "tooth-rct",
  },
  {
    key: "Tooth Extraction (Oral Surgery)",
    label: "Tooth Extraction",
    subtitle: "Oral Surgery",
    description: "Surgical removal of damaged, infected, impacted or non-restorable teeth under local/general anesthesia.",
    icon: "tooth-extract",
  },
  {
    key: "Implant Surgery",
    label: "Implant Surgery",
    subtitle: "Dental Implants",
    description: "Titanium implant placement into the jawbone to replace missing teeth — a multi-stage surgical procedure.",
    icon: "implant",
  },
] as const;

export const CONSENT_TEMPLATES: Record<string, ConsentTemplate> = {
  "Root Canal Treatment (Endodontics)": {
    description:
      "Root canal treatment is performed to remove infected or damaged pulp tissue from inside the tooth, disinfect the root canals, and seal the tooth to preserve its function.",
    consentDeclaration:
      "I understand the purpose, benefits, limitations, and possible complications of root canal treatment and voluntarily consent to the procedure.",
    risks: [
      "Pain or discomfort after treatment",
      "Instrument separation inside canal",
      "Incomplete healing",
      "Need for retreatment",
      "Tooth fracture",
      "Need for extraction if treatment fails",
    ],
    alternatives: [
      "Tooth extraction",
      "Monitoring the condition",
      "No treatment",
    ],
    responsibilities: [
      "Attend follow-up appointments",
      "Maintain oral hygiene",
      "Report persistent pain or swelling",
      "Complete crown restoration if advised",
    ],
  },
  "Tooth Extraction (Oral Surgery)": {
    description:
      "Tooth extraction involves removal of a damaged, infected, impacted, or non-restorable tooth.",
    consentDeclaration:
      "I consent to the extraction of the specified tooth and any necessary supporting procedures.",
    risks: [
      "Bleeding",
      "Infection",
      "Dry socket",
      "Swelling",
      "Nerve injury",
      "Sinus complications",
      "Jaw stiffness",
    ],
    alternatives: [
      "Root canal treatment",
      "Crown restoration",
      "Observation",
    ],
    responsibilities: [
      "Follow medication instructions",
      "Avoid smoking",
      "Avoid rinsing for 24 hours",
      "Attend review visits",
    ],
  },
  "Implant Surgery": {
    description:
      "Dental implant placement involves inserting a titanium implant into the jawbone to replace missing teeth.",
    consentDeclaration:
      "I consent to the placement of dental implants and understand that this is a surgical procedure requiring multiple stages.",
    risks: [
      "Implant failure",
      "Infection",
      "Bone loss",
      "Nerve injury",
      "Sinus perforation",
      "Need for additional surgeries",
    ],
    alternatives: [
      "Dental bridge",
      "Removable denture",
      "No treatment",
    ],
    responsibilities: [
      "Maintain excellent oral hygiene",
      "Attend maintenance visits",
      "Avoid smoking",
      "Follow post-operative instructions",
    ],
  },
  "Orthodontic Braces / Aligners": {
    description:
      "Orthodontic treatment uses braces or clear aligners to correct dental irregularities and improve bite and alignment.",
    consentDeclaration:
      "I consent to orthodontic treatment and understand that results depend on my cooperation in wearing appliances and attending appointments.",
    risks: [
      "Tooth sensitivity",
      "Root resorption",
      "Relapse",
      "Soft tissue irritation",
      "Extended treatment duration",
    ],
    alternatives: [
      "No treatment",
      "Cosmetic treatment",
    ],
    responsibilities: [
      "Wear aligners as instructed",
      "Attend appointments",
      "Maintain oral hygiene",
      "Avoid damaging foods",
    ],
  },
  "Scaling & Root Planing": {
    description:
      "Scaling and root planing is a deep cleaning procedure to remove plaque and tartar from below the gumline and smooth root surfaces to promote gum healing.",
    consentDeclaration:
      "I consent to scaling and root planing and understand the nature of the procedure and its limitations.",
    risks: [
      "Gum sensitivity",
      "Temporary bleeding",
      "Root sensitivity",
      "Discomfort",
    ],
    alternatives: [
      "Regular scaling only",
      "Monitoring",
      "No treatment",
    ],
    responsibilities: [
      "Follow oral hygiene instructions",
      "Use prescribed mouthwash",
      "Attend maintenance visits",
    ],
  },
  "Crown & Bridge": {
    description:
      "Crown and bridge treatment involves placing fixed prosthetic restorations to restore damaged teeth or replace missing teeth.",
    consentDeclaration:
      "I consent to crown and/or bridge placement and understand that natural tooth structure may be reduced as part of the procedure.",
    risks: [
      "Tooth sensitivity",
      "Crown loosening",
      "Fracture",
      "Need for root canal treatment",
    ],
    alternatives: [
      "Dental implant",
      "Removable partial denture",
      "No treatment",
    ],
    responsibilities: [
      "Avoid excessive force",
      "Maintain oral hygiene",
      "Attend review appointments",
    ],
  },
  "Denture Treatment": {
    description:
      "Denture treatment involves fabricating and fitting removable prostheses to replace missing teeth and restore chewing function and aesthetics.",
    consentDeclaration:
      "I consent to denture treatment and understand that an adaptation period is expected.",
    risks: [
      "Sore spots",
      "Speech difficulty",
      "Adaptation period",
      "Loosening over time",
    ],
    alternatives: [
      "Dental implants",
      "Fixed bridge",
      "No treatment",
    ],
    responsibilities: [
      "Follow cleaning instructions",
      "Attend adjustment visits",
      "Remove dentures during sleep if advised",
    ],
  },
  "Teeth Whitening": {
    description:
      "Teeth whitening is a cosmetic dental procedure that lightens the color of teeth using bleaching agents.",
    consentDeclaration:
      "I consent to teeth whitening treatment and understand that results may vary and are not guaranteed to be permanent.",
    risks: [
      "Tooth sensitivity",
      "Gum irritation",
      "Uneven whitening",
    ],
    alternatives: [
      "Veneers / Smile Design",
      "No treatment",
    ],
    responsibilities: [
      "Avoid staining foods",
      "Follow maintenance instructions",
    ],
  },
  "Veneers / Smile Design": {
    description:
      "Veneers are thin porcelain or composite shells bonded to the front surface of teeth to improve appearance, shape, or color.",
    consentDeclaration:
      "I consent to veneer placement and understand that the procedure involves irreversible removal of tooth enamel.",
    risks: [
      "Sensitivity",
      "Chipping",
      "Color mismatch",
      "Replacement requirement",
    ],
    alternatives: [
      "Teeth whitening",
      "Orthodontic treatment",
      "No treatment",
    ],
    responsibilities: [
      "Avoid hard objects",
      "Maintain oral hygiene",
    ],
  },
};

export const mapProcedureLabelToKey = (label: string): string => {
  const labelMap: Record<string, string> = {
    "Consultation / Check-up": "consultation",
    "Consultation": "consultation",
    "follow up visit": "follow-up",
    "X-ray review": "xray-review",
    "Teeth Cleaning": "cleaning",
    "Tooth Pain / Emergency": "emergency",
    "Filling": "filling",
    "Root Canal Treatment": "root-canal",
    "Extraction / Wisdom Tooth": "extraction",
    "Braces / Aligners": "orthodontics",
    "Implants": "implants",
    "full mouth rehabilitation": "full-mouth-rehab",
    "Veneers/Cosmetic Dentistry": "veneers-cosmetic",
    "Child Dentistry": "child-dentistry",
    "Crown": "crown",
    "Denture": "denture",
    "Toothache": "toothache",
    "Swelling / Infection": "swelling-infection",
    "Broken Tooth": "broken-tooth",
    "Trauma / Injury": "trauma-injury",
    "other/ not sure": "other",
    
    // Legacy mapping fallbacks
    "Teeth Cleaning & Scaling": "cleaning",
    "Dental Filling": "filling",
    "Tooth Extraction": "extraction",
    "Root Canal": "root-canal",
    "Crown Fitting": "crown",
    "Orthodontics": "orthodontics",
    "Oral Surgery": "surgery",
    "Other": "other",
  };
  return labelMap[label] || label.toLowerCase();
};
