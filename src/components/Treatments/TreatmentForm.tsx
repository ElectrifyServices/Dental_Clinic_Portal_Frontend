import React, { useState } from 'react';
import { X, Save, User, Calendar, DollarSign, FileText, Camera, Plus, Trash2 } from 'lucide-react';

interface TreatmentFormProps {
  onClose: () => void;
  onSave: (treatment: any) => void;
  treatment?: any;
}

export function TreatmentForm({ onClose, onSave, treatment }: TreatmentFormProps) {
  const [formData, setFormData] = useState({
    patientName: treatment?.patientName || '',
    procedure: treatment?.procedure || '',
    tooth: treatment?.tooth || '',
    date: treatment?.date || new Date().toISOString().split('T')[0],
    notes: treatment?.notes || '',
    cost: treatment?.cost || 0,
    status: treatment?.status || 'planned',
    nextAppointment: treatment?.nextAppointment || '',
    images: treatment?.images || [],
    doctorId: treatment?.doctorId || '1',
    doctorName: treatment?.doctorName || 'Dr. Rajesh Sharma'
  });

  const [prescriptions, setPrescriptions] = useState(treatment?.prescriptions || [
    { id: '1', medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  const [treatmentSessions, setTreatmentSessions] = useState(treatment?.sessions || []);
  const [showSessionPlanner, setShowSessionPlanner] = useState(true); // Always show sessions

  const patients = [
    'Rajesh Kumar',
    'Priya Sharma', 
    'Amit Singh',
    'Neha Gupta',
    'Suresh Patel'
  ];

  const doctors = [
    { id: '1', name: 'Dr. Rajesh Sharma', specialization: 'General Dentistry' },
    { id: '2', name: 'Dr. Priya Patel', specialization: 'Orthodontics' },
    { id: '3', name: 'Dr. Amit Singh', specialization: 'Oral Surgery' }
  ];

  const procedures = [
    'Regular Checkup',
    'Teeth Cleaning & Scaling',
    'Dental Filling',
    'Root Canal Treatment',
    'Crown Placement',
    'Tooth Extraction',
    'Dental Implant',
    'Orthodontic Treatment',
    'Periodontal Treatment',
    'Oral Surgery',
    'Cosmetic Dentistry',
    'Denture Fitting'
  ];

  // Predefined treatment templates with multiple sessions
  const treatmentTemplates = {
    'Root Canal Treatment': {
      sessions: [
        { name: 'Initial Consultation & X-Ray', duration: 30, gap: 0, description: 'Diagnosis and treatment planning', isRequired: true },
        { name: 'Pulp Removal & Cleaning', duration: 60, gap: 1, description: 'Access cavity, pulp removal, canal cleaning', isRequired: true },
        { name: 'Canal Filling & Sealing', duration: 45, gap: 7, description: 'Root canal filling and temporary crown', isRequired: true },
        { name: 'Crown Preparation', duration: 60, gap: 14, description: 'Permanent crown fitting', isRequired: true }
      ],
      totalCost: 8000
    },
    'Regular Checkup': {
      sessions: [
        { name: 'Oral Examination', duration: 30, gap: 0, description: 'Complete oral health assessment', isRequired: true }
      ],
      totalCost: 500
    },
    'Teeth Cleaning & Scaling': {
      sessions: [
        { name: 'Initial Assessment', duration: 15, gap: 0, description: 'Oral health evaluation', isRequired: true },
        { name: 'Scaling & Cleaning', duration: 45, gap: 0, description: 'Professional teeth cleaning', isRequired: true },
        { name: 'Fluoride Treatment', duration: 15, gap: 0, description: 'Fluoride application', isRequired: false }
      ],
      totalCost: 1500
    },
    'Dental Filling': {
      sessions: [
        { name: 'Cavity Assessment', duration: 20, gap: 0, description: 'Examine and prepare cavity', isRequired: true },
        { name: 'Filling Procedure', duration: 45, gap: 0, description: 'Remove decay and place filling', isRequired: true }
      ],
      totalCost: 2000
    },
    'Orthodontic Treatment': {
      sessions: [
        { name: 'Initial Consultation', duration: 45, gap: 0, description: 'Assessment and treatment planning', isRequired: true },
        { name: 'Braces Installation', duration: 90, gap: 7, description: 'Bracket placement and wire installation', isRequired: true },
        { name: 'Monthly Adjustment 1', duration: 30, gap: 30, description: 'Wire tightening and progress check', isRequired: true },
        { name: 'Monthly Adjustment 2', duration: 30, gap: 60, description: 'Continued adjustment and monitoring', isRequired: true },
        { name: 'Monthly Adjustment 3', duration: 30, gap: 90, description: 'Progress evaluation and adjustment', isRequired: true }
      ],
      totalCost: 25000
    },
    'Dental Implant': {
      sessions: [
        { name: 'Pre-surgical Consultation', duration: 45, gap: 0, description: 'CT scan and surgical planning', isRequired: true },
        { name: 'Implant Placement Surgery', duration: 120, gap: 7, description: 'Surgical implant placement', isRequired: true },
        { name: 'Healing Check (2 weeks)', duration: 30, gap: 14, description: 'Post-surgical healing assessment', isRequired: true },
        { name: 'Healing Check (6 weeks)', duration: 30, gap: 42, description: 'Osseointegration progress check', isRequired: true },
        { name: 'Crown Placement', duration: 60, gap: 90, description: 'Final crown attachment', isRequired: true }
      ],
      totalCost: 35000
    },
    'Crown Placement': {
      sessions: [
        { name: 'Tooth Preparation', duration: 60, gap: 0, description: 'Prepare tooth and take impressions', isRequired: true },
        { name: 'Temporary Crown Fitting', duration: 30, gap: 0, description: 'Place temporary crown', isRequired: true },
        { name: 'Permanent Crown Placement', duration: 45, gap: 14, description: 'Fit and cement permanent crown', isRequired: true }
      ],
      totalCost: 8000
    },
    'Tooth Extraction': {
      sessions: [
        { name: 'Pre-extraction Assessment', duration: 20, gap: 0, description: 'X-ray and extraction planning', isRequired: true },
        { name: 'Extraction Procedure', duration: 45, gap: 0, description: 'Tooth extraction and suturing', isRequired: true },
        { name: 'Follow-up Check', duration: 15, gap: 7, description: 'Healing assessment and suture removal', isRequired: false }
      ],
      totalCost: 1000
    }
  };

  const teeth = [
    // Upper teeth
    '11 (Upper Right Central Incisor)', '12 (Upper Right Lateral Incisor)', '13 (Upper Right Canine)',
    '14 (Upper Right First Premolar)', '15 (Upper Right Second Premolar)', '16 (Upper Right First Molar)',
    '17 (Upper Right Second Molar)', '18 (Upper Right Third Molar)',
    '21 (Upper Left Central Incisor)', '22 (Upper Left Lateral Incisor)', '23 (Upper Left Canine)',
    '24 (Upper Left First Premolar)', '25 (Upper Left Second Premolar)', '26 (Upper Left First Molar)',
    '27 (Upper Left Second Molar)', '28 (Upper Left Third Molar)',
    // Lower teeth
    '31 (Lower Left Central Incisor)', '32 (Lower Left Lateral Incisor)', '33 (Lower Left Canine)',
    '34 (Lower Left First Premolar)', '35 (Lower Left Second Premolar)', '36 (Lower Left First Molar)',
    '37 (Lower Left Second Molar)', '38 (Lower Left Third Molar)',
    '41 (Lower Right Central Incisor)', '42 (Lower Right Lateral Incisor)', '43 (Lower Right Canine)',
    '44 (Lower Right First Premolar)', '45 (Lower Right Second Premolar)', '46 (Lower Right First Molar)',
    '47 (Lower Right Second Molar)', '48 (Lower Right Third Molar)',
    'Full mouth', 'Multiple teeth'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: treatment?.id || Date.now().toString(),
      patientId: Date.now().toString(),
      prescriptions: prescriptions.filter(p => p.medicine.trim() !== ''),
      cost: parseFloat(formData.cost.toString())
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-generate sessions when procedure changes
      if (name === 'procedure') {
        const template = treatmentTemplates[value as keyof typeof treatmentTemplates];
        if (template) {
          updated.cost = template.totalCost;
          
          // Generate predefined sessions with suggested dates
          const baseDate = new Date(updated.date);
          const generatedSessions = template.sessions.map((session, index) => {
            const sessionDate = new Date(baseDate);
            sessionDate.setDate(baseDate.getDate() + session.gap);
            
            return {
              id: `session-${index + 1}`,
              sessionNumber: index + 1,
              name: session.name,
              description: session.description,
              suggestedDate: sessionDate.toISOString().split('T')[0],
              scheduledDate: sessionDate.toISOString().split('T')[0],
              duration: session.duration,
              status: 'planned',
              isFlexible: !session.isRequired,
              isRequired: session.isRequired,
              isOptional: !session.isRequired,
              cost: Math.round(template.totalCost / template.sessions.length),
              isModified: false,
              notes: ''
            };
          });
          
          setTreatmentSessions(generatedSessions);
        } else {
          // For procedures without templates, create a single session
          const singleSession = {
            id: 'session-1',
            sessionNumber: 1,
            name: value || 'Treatment Session',
            description: 'Single session treatment',
            suggestedDate: updated.date,
            scheduledDate: updated.date,
            duration: 45,
            status: 'scheduled',
            isFlexible: true,
            isRequired: true,
            cost: updated.cost || 0,
            isModified: false,
            notes: ''
          };
          
          setTreatmentSessions([singleSession]);
        }
      }
      
      return updated;
    });
  };

  const updateSessionDate = (sessionId: string, newDate: string) => {
    setTreatmentSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const isModified = newDate !== session.suggestedDate;
        return {
          ...session,
          scheduledDate: newDate,
          isModified
        };
      }
      return session;
    }));
  };

  const updateSessionStatus = (sessionId: string, newStatus: string) => {
    setTreatmentSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, status: newStatus } : session
    ));
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    setTreatmentSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, notes } : session
    ));
  };

  const toggleSessionFlexibility = (sessionId: string) => {
    setTreatmentSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, isFlexible: !session.isFlexible } : session
    ));
  };

  const addNewSession = () => {
    const newSession = {
      id: `session-${treatmentSessions.length + 1}`,
      sessionNumber: treatmentSessions.length + 1,
      name: 'Additional Session',
      description: 'Custom treatment session',
      suggestedDate: formData.date,
      scheduledDate: formData.date,
      duration: 45,
      status: 'planned',
      isFlexible: true,
      isRequired: false,
      cost: 0,
      isModified: false,
      notes: ''
    };
    
    setTreatmentSessions(prev => [...prev, newSession]);
  };

  const removeSession = (sessionId: string) => {
    setTreatmentSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      id: Date.now().toString(),
      medicine: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const updatePrescription = (id: string, field: string, value: string) => {
    setPrescriptions(prescriptions.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...imageUrls] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {treatment ? 'Edit Treatment Plan' : 'Create New Treatment Plan'}
              </h2>
              <p className="text-gray-600 mt-1">Plan and track dental procedures and treatments</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Patient Name *
              </label>
              <select
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient} value={patient}>{patient}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Procedure *
              </label>
              <select
                name="procedure"
                value={formData.procedure}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Procedure</option>
                {procedures.map(procedure => (
                  <option key={procedure} value={procedure}>{procedure}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tooth/Area *
              </label>
              <select
                name="tooth"
                value={formData.tooth}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Tooth</option>
                {teeth.map(tooth => (
                  <option key={tooth} value={tooth}>{tooth}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned Doctor *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={(e) => {
                  const selectedDoctor = doctors.find(d => d.id === e.target.value);
                  setFormData({
                    ...formData,
                    doctorId: e.target.value,
                    doctorName: selectedDoctor?.name || ''
                  });
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Treatment Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Treatment Cost (₹)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter treatment cost"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Next Appointment
              </label>
              <input
                type="date"
                name="nextAppointment"
                value={formData.nextAppointment}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Treatment Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter detailed treatment notes, observations, and instructions..."
            />
          </div>

          {/* Multi-Session Treatment Planning - Always Visible */}
          {formData.procedure && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Treatment Sessions ({treatmentSessions.length})
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Total Cost: ₹{treatmentSessions.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={addNewSession}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Session
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto bg-gray-50 rounded-xl p-4">
                {treatmentSessions.map((session, index) => (
                  <div key={session.id} className={`rounded-lg p-4 border transition-all duration-200 ${
                    session.status === 'completed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                    session.status === 'in-progress' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
                    session.isModified ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' :
                    'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3 ${
                          session.status === 'completed' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                          session.status === 'in-progress' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                          'bg-gradient-to-r from-gray-600 to-slate-600'
                        }`}>
                          {session.sessionNumber}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={session.name}
                              onChange={(e) => setTreatmentSessions(prev => prev.map(s => 
                                s.id === session.id ? { ...s, name: e.target.value } : s
                              ))}
                              className="font-semibold text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-sm"
                            />
                            {session.isRequired && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{session.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                          value={session.status}
                          onChange={(e) => updateSessionStatus(session.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-1 focus:ring-blue-500 ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="planned">PLANNED</option>
                          <option value="scheduled">SCHEDULED</option>
                          <option value="in-progress">IN PROGRESS</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!session.isOptional}
                            onChange={() => setTreatmentSessions(prev => prev.map(s => 
                              s.id === session.id ? { ...s, isOptional: !s.isOptional, isRequired: s.isOptional } : s
                            ))}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-1 text-xs text-gray-600">Required</span>
                        </div>
                        <input
                          type="number"
                          value={session.cost}
                          onChange={(e) => setTreatmentSessions(prev => prev.map(s => 
                            s.id === session.id ? { ...s, cost: parseInt(e.target.value) || 0 } : s
                          ))}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                          placeholder="Cost"
                        />
                        {session.isOptional && (
                          <button
                            type="button"
                            onClick={() => removeSession(session.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Suggested Date
                        </label>
                        <div className="text-xs text-gray-800 bg-white px-2 py-1 rounded-lg border">
                          {new Date(session.suggestedDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Scheduled Date
                        </label>
                        <input
                          type="date"
                          value={session.scheduledDate}
                          onChange={(e) => updateSessionDate(session.id, e.target.value)}
                          className={`w-full px-2 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                            session.isModified ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                          }`}
                          min={new Date().toISOString().split('T')[0]}
                          disabled={false}
                        />
                        {session.isModified && (
                          <p className="text-xs text-orange-600 mt-1">Modified from suggested date</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                        <input
                          type="number"
                          value={session.duration}
                          onChange={(e) => setTreatmentSessions(prev => prev.map(s => 
                            s.id === session.id ? { ...s, duration: parseInt(e.target.value) || 30 } : s
                          ))}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                          min="15"
                          step="15"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Flexible</label>
                        <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border">
                          <input
                            type="checkbox"
                            checked={session.isFlexible}
                            onChange={() => toggleSessionFlexibility(session.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">±3 days</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                      <textarea
                        value={session.notes}
                        onChange={(e) => updateSessionNotes(session.id, e.target.value)}
                        rows={1}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                        placeholder="Add notes for this session..."
                      />
                    </div>

                    {session.isFlexible && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ This session can be rescheduled based on patient availability
                        </p>
                      </div>
                    )}

                    {session.isModified && (
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-orange-700">
                          ⚠️ Date modified from suggested schedule - Doctor review recommended
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {treatmentSessions.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">No sessions defined for this treatment</p>
                    <button
                      type="button"
                      onClick={addNewSession}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Add First Session
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">Session Management:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>Required sessions</strong> cannot be deleted but can be rescheduled</li>
                  <li>• <strong>Status updates</strong> help track treatment progress</li>
                  <li>• <strong>Flexible sessions</strong> allow ±3 days rescheduling</li>
                  <li>• <strong>Each session</strong> creates a separate appointment when saved</li>
                </ul>
              </div>
            </div>
          )}

          {/* Prescriptions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Prescriptions</h3>
              <button
                type="button"
                onClick={addPrescription}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center text-sm font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <div key={prescription.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
                    <input
                      type="text"
                      value={prescription.medicine}
                      onChange={(e) => updatePrescription(prescription.id, 'medicine', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(prescription.id, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="500mg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => updatePrescription(prescription.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3 times daily"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => updatePrescription(prescription.id, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5 days"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <input
                      type="text"
                      value={prescription.instructions}
                      onChange={(e) => updatePrescription(prescription.id, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="After meals"
                    />
                  </div>
                  <div className="col-span-1">
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescription(prescription.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Treatment Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload before/after images, X-rays, or other relevant photos</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Images
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Treatment ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Treatment Plan ({treatmentSessions.length} sessions)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}