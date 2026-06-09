export const translations = {
  en: {
    rx: "Rx",
    medicine: "Medicine",
    dosage: "Dosage",
    timing: "Timing - Freq. - Duration",
    qty: "Qty",
    complaints: "Complaints",
    diagnosis: "Diagnosis",
    advice: "Advice",
    tests: "Tests Prescribed",
    nextVisit: "Next Visit",
    date: "Date",
    signature: "Signature",
    composition: "Composition",
    timingLabel: "Timing",
    prescribedOn: "Prescribed on",
  },
  gu: {
    rx: "Rx (દવાઓ)",
    medicine: "દવા",
    dosage: "માત્રા",
    timing: "સમય - આવર્તન - સમયગાળો",
    qty: "જથ્થો",
    complaints: "ફરિયાદ / લક્ષણો",
    diagnosis: "નિદાન",
    advice: "સલાહ",
    tests: "જરૂરી તપાસ (લેબ ટેસ્ટ)",
    nextVisit: "આગામી મુલાકાત",
    date: "તારીખ",
    signature: "સહી",
    composition: "સંયોજન",
    timingLabel: "સમય",
    prescribedOn: "તારીખે લખેલ",
    yrs: "વર્ષ",
    male: "પુરુષ",
    female: "સ્ત્રી",
    other: "અન્ય",
    bpUnit: "મીમી એચજી",
    heightUnit: "સેમી",
    weightUnit: "કિલો",
    bmiUnit: "કિલો/મી²",
    months: "મહિના",
    days: "દિવસ",
    dentalSurgeon: "કન્સલ્ટન્ટ ડેન્ટલ સર્જન",
    clinicName: "ડેન્ટલકેર પ્રો ક્લિનિક",
    doctorName: "ડો. રાજેશ શર્મા",
    clinicAddress: "#૧૦૨, સી બ્લોક, સાઉથ એક્સટેન્શન - ૧",
    clinicCity: "નવી દિલ્હી",
    doctorDegrees: "બી.ડી.એસ., એમ.ડી.એસ. (ઓરલ એન્ડ મેક્સિલોફેસિયલ સર્જરી)",
    phoneLabel: "ફોન",
    mobileLabel: "મોબાઈલ",
    emailLabel: "ઈમેલ",
    bpLabel: "બી.પી.",
    heightLabel: "ઊંચાઈ",
    weightLabel: "વજન",
    bmiLabel: "બી.એમ.આઈ.",
    patientNameLabel: "દર્દીનું નામ",
    appDownload:
      "તમારી ડિજિટલ પ્રિસ્ક્રિપ્શન જોવા અને ડોક્ટર સાથે ચેટ કરવા માટે ગૂગલ પ્લે સ્ટોર પરથી 'HealthPlix' એપ ડાઉનલોડ કરો અને QR કોડ સ્કેન કરો.",
  },
};

export const translateValue = async (val: string, targetLang: string) => {
  if (!val || targetLang === "en") return val;

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(val)}`,
    );
    const data = await response.json();
    return data[0].map((x: any) => x[0]).join("");
  } catch (error) {
    console.error("Translation error:", error);
    return val;
  }
};
