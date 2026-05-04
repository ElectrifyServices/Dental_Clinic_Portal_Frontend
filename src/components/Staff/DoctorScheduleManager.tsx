import React, { useState } from 'react';
import { Save, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Modal, Button, FormField, Badge } from '@/components/ui';

interface DoctorScheduleManagerProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
  onSave: (schedule: any) => void;
  currentSchedule?: any;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export function DoctorScheduleManager({ doctorId, doctorName, onClose, onSave, currentSchedule }: DoctorScheduleManagerProps) {
  const [schedule, setSchedule] = useState(currentSchedule || {
    monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    friday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    saturday: { isWorking: true, startTime: '09:00', endTime: '14:00' },
    sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' }
  });

  const [settings, setSettings] = useState({ duration: 30, bufferTime: 5 });

  const handleDayChange = (day: string, field: string, value: any) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const generateTimeSlots = (dayKey: string) => {
    const day = schedule[dayKey];
    if (!day.isWorking) return [];
    const slots = [];
    const start = new Date(`2024-01-01 ${day.startTime}`);
    const end = new Date(`2024-01-01 ${day.endTime}`);
    const breakS = day.breakStart ? new Date(`2024-01-01 ${day.breakStart}`) : null;
    const breakE = day.breakEnd ? new Date(`2024-01-01 ${day.breakEnd}`) : null;

    let current = new Date(start);
    while (current < end) {
      if (breakS && breakE && current >= breakS && current < breakE) {
        current = new Date(breakE); continue;
      }
      slots.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + settings.duration + settings.bufferTime);
    }
    return slots;
  };

  return (
    <Modal
      title="Staff Schedule Manager"
      subtitle={doctorName}
      onClose={onClose}
      size="2xl"
      icon={<Clock className="w-4 h-4" />}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ doctorId, workingHours: schedule, timeSlots: settings })} className="gap-2">
            <Save className="w-4 h-4" /> Save Schedule
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Appointment Slot Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Slot Duration (Mins)">
              <select value={settings.duration} onChange={(e) => setSettings(p => ({ ...p, duration: Number(e.target.value) }))}
                className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                {[15, 30, 45, 60].map(v => <option key={v} value={v}>{v} Minutes</option>)}
              </select>
            </FormField>
            <FormField label="Buffer Time (Mins)">
              <select value={settings.bufferTime} onChange={(e) => setSettings(p => ({ ...p, bufferTime: Number(e.target.value) }))}
                className="w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                {[0, 5, 10, 15].map(v => <option key={v} value={v}>{v === 0 ? 'No Buffer' : `${v} Minutes`}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2 px-1">
            <Calendar className="w-4 h-4" /> Weekly Operating Hours
          </h3>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const isWorking = schedule[day.key]?.isWorking;
              const slots = generateTimeSlots(day.key);
              return (
                <div key={day.key} className={`p-4 border rounded-2xl transition-all ${isWorking ? 'border-primary/20 bg-card' : 'border-border bg-muted/20 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] uppercase transition-colors ${isWorking ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {day.label.slice(0, 3)}
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{day.label}</h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isWorking} onChange={(e) => handleDayChange(day.key, 'isWorking', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Working Day</span>
                    </label>
                  </div>

                  {isWorking && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <FormField label="Start Time"><input type="time" value={schedule[day.key]?.startTime} onChange={(e) => handleDayChange(day.key, 'startTime', e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold" /></FormField>
                        <FormField label="End Time"><input type="time" value={schedule[day.key]?.endTime} onChange={(e) => handleDayChange(day.key, 'endTime', e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs font-bold" /></FormField>
                        <FormField label="Break Start"><input type="time" value={schedule[day.key]?.breakStart} onChange={(e) => handleDayChange(day.key, 'breakStart', e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs font-medium text-muted-foreground bg-muted/30" /></FormField>
                        <FormField label="Break End"><input type="time" value={schedule[day.key]?.breakEnd} onChange={(e) => handleDayChange(day.key, 'breakEnd', e.target.value)} className="w-full px-3 py-1.5 border rounded-xl text-xs font-medium text-muted-foreground bg-muted/30" /></FormField>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 items-center bg-muted/30 p-3 rounded-xl">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-2">Sample Slots:</span>
                        {slots.slice(0, 8).map((s, i) => <Badge key={i} variant="blue" className="text-[9px] font-bold px-1.5 h-4">{s}</Badge>)}
                        {slots.length > 8 && <span className="text-[9px] font-bold text-muted-foreground">+{slots.length - 8} more</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}