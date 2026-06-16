import React from 'react';
import { Modal } from '../../ui';
import { useModal } from '../../../contexts/ModalContext';
import { useCorporateData } from '../../../hooks/useCorporateData';
import { QuickRegistrationFlow } from './QuickRegistrationFlow';

export function QuickRegistrationModal() {
  const { activeModal, setActiveModal } = useModal();
  const { data: plansData, isLoading } = useCorporateData();

  if (activeModal !== 'quickRegister') return null;

  return (
    <Modal
      isOpen={true}
      onClose={() => setActiveModal(null)}
      title="Quick Registration"
      className="max-w-2xl p-0 overflow-hidden"
    >
      <div className="bg-slate-50 p-4 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground font-medium">Loading plans...</p>
          </div>
        ) : (
          <QuickRegistrationFlow
            plans={plansData?.data || []}
            onRegistered={() => setActiveModal(null)}
          />
        )}
      </div>
    </Modal>
  );
}
