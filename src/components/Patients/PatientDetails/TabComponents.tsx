import { Activity, AlertTriangle, Calendar, CheckCircle, CreditCard, Heart, Image as ImageIcon, Pill, Printer, Send, Stethoscope, User } from "lucide-react";

// --- Reusable Empty State Component ---
const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 ring-8 ring-gray-50/50">
      <Icon className="w-10 h-10 text-gray-300" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-1 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
      {description}
    </p>
  </div>
);

// --- Medical Info Tab ---
export const MedicalInfoTab = ({ patient }: { patient: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
        <Heart className="w-5 h-5 mr-2" /> Medical History
      </h3>
      <div className="space-y-3">
        {(patient?.medicalHistory || []).length > 0 ? (
          patient.medicalHistory.map((condition: string, index: number) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
              <p className="text-blue-800 font-medium">{condition}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-600">No medical history recorded</p>
          </div>
        )}
      </div>
    </div>
    <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
      <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" /> Allergies & Alerts
      </h3>
      <div className="space-y-3">
        {(patient?.allergies || []).length > 0 ? (
          patient.allergies.map((allergy: string, index: number) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">{allergy}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-600">No allergies recorded</p>
          </div>
        )}
      </div>
    </div>
    <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patient.bloodGroup && (
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Blood Group</p>
            <p className="font-bold text-red-600">{patient.bloodGroup}</p>
          </div>
        )}
        {patient.occupation && (
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <User className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Occupation</p>
            <p className="font-medium text-gray-900">{patient.occupation}</p>
          </div>
        )}
        {patient.maritalStatus && (
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <User className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Marital Status</p>
            <p className="font-medium text-gray-900 capitalize">{patient.maritalStatus}</p>
          </div>
        )}
        {patient.insuranceProvider && (
          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
            <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Insurance</p>
            <p className="font-medium text-gray-900">{patient.insuranceProvider}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// --- Appointments Tab ---
export const AppointmentsTab = ({ patientAppointments, getStatusColor }: { patientAppointments: any[], getStatusColor: (s: string) => string }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-gray-900">Appointment History</h3>
    {patientAppointments.map((appointment) => (
      <div key={appointment.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{appointment.treatmentType || appointment.type}</p>
              <p className="text-sm text-gray-600">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
              <p className="text-sm text-gray-600">with {appointment.doctorName || appointment.doctor}</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
            {appointment.status.toUpperCase()}
          </span>
        </div>
      </div>
    ))}
    {patientAppointments.length === 0 && (
      <EmptyState 
        icon={Calendar}
        title="No appointments found"
        description="There are no past or upcoming appointments recorded for this patient yet."
      />
    )}
  </div>
);

// --- Treatments Tab ---
export const TreatmentsTab = ({ patientTreatments }: { patientTreatments: any[] }) => {
  const hasInProgress = patientTreatments.some(t => t.status === 'in-progress');
  const hasPlanned = patientTreatments.some(t => t.status === 'planned');
  const hasCompleted = patientTreatments.some(t => t.status === 'completed');

  if (patientTreatments.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900">Treatment Journey</h3>
        <EmptyState 
          icon={Stethoscope}
          title="No treatments found"
          description="A treatment journey hasn't been started yet. All active, planned, and completed procedures will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Treatment Journey</h3>
      {hasInProgress && (
        <div>
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" /> Active Treatments
          </h4>
          <div className="space-y-3">
            {patientTreatments.filter(t => t.status === 'in-progress').map((treatment) => (
              <div key={treatment.id} className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{treatment.procedure}</p>
                      <p className="text-xs text-gray-600">Tooth: <span className="font-bold">#{treatment.tooth}</span></p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(treatment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900">₹{treatment.cost.toLocaleString()}</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white uppercase">IN-PROGRESS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasPlanned && (
        <div>
          <h4 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Pending Plans
          </h4>
          <div className="space-y-3">
            {patientTreatments.filter(t => t.status === 'planned').map((treatment) => (
              <div key={treatment.id} className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                      <Stethoscope className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{treatment.procedure}</p>
                      <p className="text-xs text-gray-600">Tooth: <span className="font-bold">#{treatment.tooth}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-900">₹{treatment.cost.toLocaleString()}</p>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-200 text-purple-700 uppercase">PLANNED</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasCompleted && (
        <div>
          <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" /> Completed Treatments
          </h4>
          <div className="space-y-3">
            {patientTreatments.filter(t => t.status === 'completed').map((treatment) => (
              <div key={treatment.id} className="bg-green-50/30 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-700">{treatment.procedure}</p>
                      <p className="text-xs text-gray-500">Tooth: #{treatment.tooth}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">₹{treatment.cost.toLocaleString()}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase">{new Date(treatment.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Billing Tab ---
export const BillingTab = ({ patient, patientInvoices, getStatusColor, handleSendReminder }: { patient: any, patientInvoices: any[], getStatusColor: (s: string) => string, handleSendReminder: () => void }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-900">Billing History</h3>
      {patient.outstandingBalance > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-red-900">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">₹{patient.outstandingBalance.toLocaleString()}</p>
            </div>
            <button onClick={handleSendReminder} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium">
              <Send className="w-4 h-4 mr-2" /> Send Reminder
            </button>
          </div>
        </div>
      )}
    </div>
    {patientInvoices.map((invoice) => (
      <div key={invoice.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{invoice.id}</p>
              <p className="text-sm text-gray-600">Issued: {new Date(invoice.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">₹{(invoice.amount || invoice.total || 0).toLocaleString()}</p>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status.toUpperCase()}</span>
          </div>
        </div>
      </div>
    ))}
    {patientInvoices.length === 0 && (
      <EmptyState 
        icon={CreditCard}
        title="No invoices found"
        description="No billing records or invoices have been generated for this patient yet."
      />
    )}
  </div>
);

// --- Prescriptions Tab ---
export const PrescriptionsTab = ({ patient, handlePrintDocument }: { patient: any, handlePrintDocument: () => void }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-900">Prescription History</h3>
      {patient.prescriptionHistory?.length > 0 && (
        <button onClick={handlePrintDocument} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-200">
          <Printer className="w-4 h-4 mr-2" /> Print Document
        </button>
      )}
    </div>
    {patient.prescriptionHistory?.map((record: any) => (
      <div key={record.id} className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-200 mb-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 leading-tight">{record.treatment}</h4>
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Date: {new Date(record.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {record.prescriptions?.map((prescription: any, index: number) => (
            <div key={index} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-400">#{index + 1}</span>
                  <h5 className="font-bold text-gray-900 text-sm">{prescription.medicine}</h5>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <span className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 border-r border-gray-200 font-bold">DOSAGE</span>
                    <span className="px-2 py-1 text-[11px] text-blue-600 font-bold">{prescription.dosage}</span>
                  </div>
                  <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <span className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 border-r border-gray-200 font-bold">FREQ</span>
                    <span className="px-2 py-1 text-[11px] text-blue-600 font-bold">{prescription.frequency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
    {(!patient.prescriptionHistory || patient.prescriptionHistory.length === 0) && (
      <EmptyState 
        icon={Pill}
        title="No prescriptions found"
        description="There are no prescriptions recorded for this patient. After a consultation, the prescription will appear here."
      />
    )}
  </div>
);

// --- Documents Tab ---
export const DocumentsTab = ({ patient, loading }: { patient: any, loading: boolean }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Documents & Images</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patient.documents?.map((doc: any) => (
        <div key={doc.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
          <img src={doc.url} alt={doc.name} className="w-full h-40 object-cover rounded-lg mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">{doc.name}</h4>
          <p className="text-sm text-gray-600">{new Date(doc.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
    {(!patient.documents || patient.documents.length === 0) && (
      <EmptyState 
        icon={ImageIcon}
        title="No documents uploaded"
        description="X-rays, dental scans, and other medical documents will be visible here once uploaded."
      />
    )}
  </div>
);

// --- Family Tab ---
export const FamilyTab = ({ familyMembers }: { familyMembers: any[] }) => {
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Family Members</h3>
          <p className="text-sm text-gray-500 mt-1">Information about registered family members under this account</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 text-sm font-bold border border-blue-100">
          {familyMembers.length} Linked Member{familyMembers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xl shadow-sm">
                  {member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{member.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded tracking-wider">
                      {member.relation || 'Relation N/A'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ID: {member.id}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {member.status || 'Active'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-50 pt-4">
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Age
                </p>
                <p className="font-bold text-gray-900 text-sm">{calculateAge(member.dateOfBirth)} Years</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Last Visit
                </p>
                <p className="font-bold text-gray-900 text-sm">{member.lastVisit || 'No visits'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Outstanding Balance
                    </p>
                    <p className={`font-bold text-sm ${member.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{(member.outstandingBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  {member.outstandingBalance > 0 && (
                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded uppercase animate-pulse">Payment Due</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {familyMembers.length === 0 && (
        <EmptyState 
          icon={User}
          title="No family members linked"
          description="This patient is currently registered as an individual account. All linked family members will appear here."
        />
      )}
    </div>
  );
};
