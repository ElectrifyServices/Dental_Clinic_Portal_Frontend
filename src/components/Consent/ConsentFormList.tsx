import React, { useState } from 'react';
import { Search, Plus, FileText, Calendar, User, Eye, Trash2, Shield, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface ConsentFormListProps {
  forms: any[];
  onAddForm: () => void;
  onViewForm: (form: any) => void;
  onDeleteForm: (id: string) => void;
}

export function ConsentFormList({ forms, onAddForm, onViewForm, onDeleteForm }: ConsentFormListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredForms = forms.filter(form =>
    form.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Consent Management</h2>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Legally verified patient treatment authorizations
          </p>
        </div>
        <button
          onClick={onAddForm}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 flex items-center transition-all active:scale-95 shadow-xl shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Medical Consent
        </button>
      </div>

      <div className="relative group">
        <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by patient name or procedure..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:border-blue-500 outline-none transition-all shadow-sm font-semibold text-gray-700"
        />
      </div>

      {filteredForms.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Consent Forms Found</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start by creating a new authorization form for a patient procedure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredForms.map((form, index) => (
            <div
              key={form.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500">
                    <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewForm(form.id)}
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteForm(form.id)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Patient</span>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{form.patientName}</h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Procedure</span>
                    <div className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-block">
                      {form.treatmentType}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      {new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-gray-50/50 rounded-b-[2.5rem] border-t border-gray-100 group-hover:bg-blue-50/50 transition-colors">
                <button
                  onClick={() => onViewForm(form.id)}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-all"
                >
                  View Full Document
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}