import React, { useState } from 'react';
import { Search, Plus, FileText, Calendar, User, Download, Eye, Shield } from 'lucide-react';
import { ConsentForm } from '../../types';

const consentForms: ConsentForm[] = [
  {
    id: '1',
    patientId: '1',
    treatmentType: 'Root Canal Treatment',
    content: 'I understand the risks and benefits of root canal treatment and consent to the procedure.',
    signature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
    date: '2024-01-15',
    witnessSignature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmx1ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'
  },
  {
    id: '2',
    patientId: '2',
    treatmentType: 'Tooth Extraction',
    content: 'I consent to the extraction of tooth #16 and understand the post-operative care instructions.',
    signature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCI+PHBhdGggZD0iTTEwIDUwIEwxOTAgNTAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
    date: '2024-01-14'
  }
];

const patients = [
  { id: '1', name: 'Rajesh Kumar' },
  { id: '2', name: 'Priya Sharma' },
  { id: '3', name: 'Amit Singh' },
  { id: '4', name: 'Neha Gupta' }
];

interface ConsentFormListProps {
  onAddForm: () => void;
  onViewForm: (formId: string) => void;
}

export function ConsentFormList({ onAddForm, onViewForm }: ConsentFormListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredForms = consentForms.filter(form => {
    const patient = patients.find(p => p.id === form.patientId);
    return form.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Digital Consent Forms</h2>
          <p className="text-gray-600 mt-1">Manage digital consent forms with electronic signatures</p>
        </div>
        <button
          onClick={onAddForm}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Consent Form
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search consent forms by treatment or patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredForms.map((form) => {
          const patient = patients.find(p => p.id === form.patientId);
          
          return (
            <div key={form.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900 text-lg">{form.treatmentType}</h3>
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 mt-1">
                      SIGNED
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-900">{patient?.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {new Date(form.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {form.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Form ID: {form.id}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewForm(form.id)}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all duration-200 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 font-medium text-sm transition-all duration-200 flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No consent forms found</h3>
          <p className="text-gray-600 mb-4">Start by creating digital consent forms for your patients.</p>
          <button
            onClick={onAddForm}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold transition-all duration-200"
          >
            Create First Form
          </button>
        </div>
      )}
    </div>
  );
}