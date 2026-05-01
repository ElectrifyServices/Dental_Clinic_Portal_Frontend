import React, { useState } from 'react';
import { X, Save, Clock, Calendar, User, Plus, Trash2 } from 'lucide-react';

interface DoctorScheduleManagerProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
  onSave: (schedule: any) => void;
  currentSchedule?: any;
}

export function DoctorScheduleManager({ 
  doctorId, 
  doctorName, 
  onClose, 
  onSave, 
  currentSchedule 
}: DoctorScheduleManagerProps) {
  const [schedule, setSchedule] = useState(currentSchedule || {
    monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isWorking: true, startTime: '09:00', endTime: '14:00' },
    sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
  });

  const [timeSlotSettings, setTimeSlotSettings] = useState({
    duration: 30, // 30 minutes per slot
    bufferTime: 5 // 5 minutes buffer between appointments
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleDayChange = (day: string, field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      doctorId,
      workingHours: schedule,
      timeSlots: timeSlotSettings
    });
  };

  const generateTimeSlots = (startTime: string, endTime: string, breakStart?: string, breakEnd?: string) => {
    const slots = [];
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = new Date(`2024-01-01 ${endTime}`);
    const breakStartTime = breakStart ? new Date(`2024-01-01 ${breakStart}`) : null;
    const breakEndTime = breakEnd ? new Date(`2024-01-01 ${breakEnd}`) : null;

    let current = new Date(start);
    while (current < end) {
      const timeString = current.toTimeString().slice(0, 5);
      
      // Skip break time
      if (breakStartTime && breakEndTime && current >= breakStartTime && current < breakEndTime) {
        current = new Date(breakEndTime);
        continue;
      }
      
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + timeSlotSettings.duration + timeSlotSettings.bufferTime);
    }
    
    return slots;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Doctor Schedule Management</h2>
              <p className="text-gray-600 mt-1">{doctorName} - Working Hours & Time Slots</p>
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
          {/* Time Slot Settings */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Slot Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Appointment Duration (minutes)
                </label>
                <select
                  value={timeSlotSettings.duration}
                  onChange={(e) => setTimeSlotSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Buffer Time (minutes)
                </label>
                <select
                  value={timeSlotSettings.bufferTime}
                  onChange={(e) => setTimeSlotSettings(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No buffer</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Weekly Working Hours
            </h3>
            
            {daysOfWeek.map((day) => (
              <div key={day.key} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">{day.label}</h4>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule[day.key]?.isWorking || false}
                      onChange={(e) => handleDayChange(day.key, 'isWorking', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Working Day</span>
                  </div>
                </div>

                {schedule[day.key]?.isWorking && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={schedule[day.key]?.startTime || '09:00'}
                        onChange={(e) => handleDayChange(day.key, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={schedule[day.key]?.endTime || '18:00'}
                        onChange={(e) => handleDayChange(day.key, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Break Start</label>
                      <input
                        type="time"
                        value={schedule[day.key]?.breakStart || ''}
                        onChange={(e) => handleDayChange(day.key, 'breakStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Break End</label>
                      <input
                        type="time"
                        value={schedule[day.key]?.breakEnd || ''}
                        onChange={(e) => handleDayChange(day.key, 'breakEnd', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Preview Time Slots */}
                {schedule[day.key]?.isWorking && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots:</h5>
                    <div className="flex flex-wrap gap-2">
                      {generateTimeSlots(
                        schedule[day.key]?.startTime || '09:00',
                        schedule[day.key]?.endTime || '18:00',
                        schedule[day.key]?.breakStart,
                        schedule[day.key]?.breakEnd
                      ).slice(0, 10).map((slot, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                          {slot}
                        </span>
                      ))}
                      {generateTimeSlots(
                        schedule[day.key]?.startTime || '09:00',
                        schedule[day.key]?.endTime || '18:00',
                        schedule[day.key]?.breakStart,
                        schedule[day.key]?.breakEnd
                      ).length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          +{generateTimeSlots(
                            schedule[day.key]?.startTime || '09:00',
                            schedule[day.key]?.endTime || '18:00',
                            schedule[day.key]?.breakStart,
                            schedule[day.key]?.breakEnd
                          ).length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}