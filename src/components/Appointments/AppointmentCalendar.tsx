import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

interface CalendarProps {
  onNewAppointment: () => void;
  appointments?: any[];
}

export function AppointmentCalendar({ onNewAppointment, appointments = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // const mockAppointments = {
  //   '2024-01-15': [
  //     { time: '09:00', patient: 'Rajesh Kumar', type: 'Consultation' },
  //     { time: '10:30', patient: 'Priya Sharma', type: 'Cleaning' },
  //     { time: '14:00', patient: 'Amit Singh', type: 'Filling' },
  //   ],
  //   '2024-01-16': [
  //     { time: '09:00', patient: 'Neha Gupta', type: 'Root Canal' },
  //     { time: '11:00', patient: 'Suresh Patel', type: 'Crown' },
  //     { time: '15:00', patient: 'Kavya Reddy', type: 'Extraction' },
  //     { time: '16:30', patient: 'Rohit Sharma', type: 'Consultation' },
  //     { time: '17:30', patient: 'Anita Desai', type: 'Cleaning' },
  //   ],
  //   '2024-01-17': [
  //     { time: '10:00', patient: 'Vikram Singh', type: 'Orthodontics' },
  //     { time: '14:30', patient: 'Meera Joshi', type: 'Surgery' },
  //   ],
  //   '2024-01-20': [
  //     { time: '09:30', patient: 'Arjun Patel', type: 'Consultation' },
  //     { time: '11:00', patient: 'Deepika Rao', type: 'Filling' },
  //     { time: '15:00', patient: 'Kiran Kumar', type: 'Cleaning' },
  //     { time: '16:30', patient: 'Sanjay Gupta', type: 'Crown' },
  //   ],
  // };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {  
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };
const getDayAppointments = (day: number) => {
  return appointments.filter(a => {
    const d = new Date(a.date)
    return (
      d.getDate() === day &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    )
  })
}
const getSelectedDateAppointments = () => {
  return appointments.filter(a => {
    const d = new Date(a.date)
    return d.toDateString() === selectedDate.toDateString()
  })
}
  // const getDayAppointments = (day: number) => {
  //   const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  //   return mockAppointments[dateKey as keyof typeof mockAppointments] || [];
  // };

  // const getSelectedDateAppointments = () => {
  //   const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  //   return mockAppointments[dateKey as keyof typeof mockAppointments] || [];
  // };

  return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onNewAppointment}
              className="ml-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-gray-500 bg-gray-50 rounded-lg">
              {day}
            </div>
          ))}
          
          {[...Array(firstDayOfMonth)].map((_, index) => (
            <div key={index} className="p-3"></div>
          ))}
          
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dayAppointments = getDayAppointments(day);
            const isSelected = selectedDate.getDate() === day && 
                             selectedDate.getMonth() === currentDate.getMonth() && 
                             selectedDate.getFullYear() === currentDate.getFullYear();
            
            return (
              <div
                key={day}
                className={`p-2 md:p-3 text-center cursor-pointer rounded-xl transition-all duration-200 min-h-[60px] md:min-h-[80px] border-2 ${
                  isToday(day)
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border-blue-600'
                    : isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-300 bg-white'
                }`}
                // onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                onClick={() => {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
  setSelectedDate(date)
  onNewAppointment(date) 
}}
              >
                <div className="font-semibold text-sm md:text-lg">{day}</div>
                {dayAppointments.length > 0 && (
                  <div className={`text-xs mt-1 px-1 md:px-2 py-1 rounded-full ${
                    isToday(day) 
                      ? 'bg-white/20 text-white' 
                      : isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {dayAppointments.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Appointments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">
            {selectedDate.toLocaleDateString('en-IN', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {getSelectedDateAppointments().length > 0 ? (
            getSelectedDateAppointments().map((appointment, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-700">{appointment.time}</span>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {appointment.type}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-900 font-medium">{appointment.patientName}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments scheduled</p>
              <button
                onClick={onNewAppointment}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Schedule an appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}