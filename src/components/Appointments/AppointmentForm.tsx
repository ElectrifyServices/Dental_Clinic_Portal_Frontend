import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User, Phone, FileText, IndianRupee, Stethoscope, MessageSquare } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentFormProps {
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => void;
  appointment?: Appointment;
  isQuickBooking?: boolean;
  doctors?: any[];
  doctorAvailability?: { [key: string]: boolean };
}

export function AppointmentForm({ onClose, onSave, appointment, isQuickBooking = false, doctors = [], doctorAvailability = {} }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patientName: appointment?.patientName || '',
    patientPhone: appointment?.patientPhone || '',
    treatment: appointment?.treatment || '',
    doctorId: appointment?.doctorId || '1',
    doctorName: appointment?.doctorName || 'Dr. Sharma',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '09:00',
    duration: appointment?.duration || 30,
    type: appointment?.type || 'consultation',
    notes: appointment?.notes || '',
    fee: appointment?.fee || 500,
    patientConcern: appointment?.patientConcern || '',
    treatmentType: appointment?.treatmentType || '',
  });

  const [bookedSlots, setBookedSlots] = useState<string[]>([
    '09:00', '10:30', '14:00', '16:30' // Mock booked slots
  ]);

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation', fee: 500 },
    { value: 'cleaning', label: 'Teeth Cleaning & Scaling', fee: 1500 },
    { value: 'filling', label: 'Dental Filling', fee: 2000 },
    { value: 'extraction', label: 'Tooth Extraction', fee: 1000 },
    { value: 'root-canal', label: 'Root Canal Treatment', fee: 5000 },
    { value: 'crown', label: 'Crown Fitting', fee: 8000 },
    { value: 'orthodontics', label: 'Orthodontic Treatment', fee: 3000 },
    { value: 'surgery', label: 'Oral Surgery', fee: 10000 },
    { value: 'emergency', label: 'Emergency Treatment', fee: 1500 },
    { value: 'other', label: 'Other Treatment', fee: 500 },
  ];

  // Generate 15-minute interval time slots in AM/PM format
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        slots.push({ time24, time12 });
      }
    }
    return slots;
  };

  const getAvailableTimeSlots = () => {
    const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
    if (!selectedDoctor || !formData.date) return [];

    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = selectedDoctor.workingHours[dayName];

    if (!daySchedule || !daySchedule.isWorking || !doctorAvailability[formData.doctorId]) return [];

    // Get all possible time slots and filter based on doctor's schedule
    const allSlots = generateTimeSlots();
    const startHour = parseInt(daySchedule.startTime.split(':')[0]);
    const endHour = parseInt(daySchedule.endTime.split(':')[0]);
    const endMinute = parseInt(daySchedule.endTime.split(':')[1]);
    
    return allSlots.filter(slot => {
      const slotHour = parseInt(slot.time24.split(':')[0]);
      const slotMinute = parseInt(slot.time24.split(':')[1]);
      
      // Check if slot is within working hours
      if (slotHour < startHour) return false;
      if (slotHour > endHour) return false;
      if (slotHour === endHour && slotMinute > endMinute) return false;
      
      // Skip break time if defined
      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const breakStartHour = parseInt(daySchedule.breakStart.split(':')[0]);
        const breakStartMinute = parseInt(daySchedule.breakStart.split(':')[1]);
        const breakEndHour = parseInt(daySchedule.breakEnd.split(':')[0]);
        const breakEndMinute = parseInt(daySchedule.breakEnd.split(':')[1]);
        
        if (slotHour > breakStartHour || (slotHour === breakStartHour && slotMinute >= breakStartMinute)) {
          if (slotHour < breakEndHour || (slotHour === breakEndHour && slotMinute < breakEndMinute)) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: appointment?.id || Date.now().toString(),
      patientId: appointment?.patientId || Date.now().toString(),
      status: appointment?.status || 'scheduled',
      reminderSent: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update fee when appointment type changes
      if (name === 'treatmentType') {
        const selectedType = appointmentTypes.find(type => type.value === value);
        if (selectedType) {
          updated.fee = selectedType.fee;
        }
      }
      
      // Auto-update fee when doctor changes
      if (name === 'doctorId') {
        const selectedDoctor = doctors.find(d => d.id === value);
        if (selectedDoctor) {
          updated.doctorName = selectedDoctor.name;
          // Keep existing fee if treatment type is selected, otherwise use doctor's consultation fee
          if (!updated.treatmentType) {
            updated.fee = selectedDoctor.consultationFee || 500;
          }
        }
      }
      
      // Reset time when doctor or date changes
      if (name === 'doctorId' || name === 'date') {
        updated.time = '';
      }
      
      return updated;
    });
  };

  const availableTimeSlots = getAvailableTimeSlots();
  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isQuickBooking ? 'Quick Appointment' : appointment ? 'Edit Appointment' : 'New Appointment'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isQuickBooking ? 'Book an appointment instantly' : 'Schedule a new patient appointment'}
              </p>
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
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter patient's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned Doctor *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
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
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Treatment *
              </label>
              <input
                type="text"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter treatment description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Treatment Type *
              </label>
              <select
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Treatment Type</option>
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - ₹{type.fee.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <IndianRupee className="w-4 h-4 inline mr-2" />
                Consultation Fee
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter fee amount"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Patient Concern *
              </label>
              <textarea
                name="patientConcern"
                value={formData.patientConcern}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe the patient's main concern or symptoms..."
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Available Time Slots *
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-4 border border-gray-300 rounded-xl bg-gray-50">
              {availableTimeSlots.map(slot => {
                const isBooked = bookedSlots.includes(slot.time24);
                const isSelected = formData.time === slot.time24;
                
                return (
                  <button
                    key={slot.time24}
                    type="button"
                    onClick={() => !isBooked && setFormData(prev => ({ ...prev, time: slot.time24 }))}
                    disabled={isBooked}
                    className={`p-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : isBooked
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:shadow-md hover:scale-105'
                    }`}
                  >
                    {slot.time12}
                    {isBooked && <div className="text-xs mt-1">Booked</div>}
                  </button>
                );
              })}
            </div>
            
            {formData.date && formData.doctorId && availableTimeSlots.length === 0 && (
              <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                {!doctorAvailability[formData.doctorId] 
                  ? `${selectedDoctor?.name} is not available on ${new Date(formData.date).toLocaleDateString()}`
                  : `No available slots for ${selectedDoctor?.name} on ${new Date(formData.date).toLocaleDateString()}`
                }
              </p>
            )}
            
            {selectedDoctor && doctorAvailability[formData.doctorId] && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Doctor:</strong> {selectedDoctor.name} ({selectedDoctor.specialization}) | 
                  <strong> Base Fee:</strong> ₹{selectedDoctor.consultationFee?.toLocaleString() || '500'} | 
                  <strong> Slots:</strong> 15-minute intervals
                </p>
              </div>
            )}
            
            {!doctorAvailability[formData.doctorId] && formData.doctorId && (
              <p className="text-sm text-orange-600 mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                ⚠️ This doctor is marked as unavailable today. Please contact reception to confirm availability.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Any additional notes, special requirements, or instructions..."
            />
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
              {isQuickBooking ? 'Book Now' : 'Save Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}