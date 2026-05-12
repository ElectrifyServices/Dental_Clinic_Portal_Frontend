import { useAppData } from "../hooks/useAppData";
import { useModal } from "../contexts/ModalContext";
import { ConsentFormList } from "../components/Consent/ConsentFormList";

export function ConsentPage() {
  const { consentForms, handleDeleteConsentForm } = useAppData();
  const { setActiveModal, setSelectedConsentForm, confirmDelete } = useModal();

  return (
    <div className="container mx-auto">
      <ConsentFormList
        forms={consentForms}
        onAddForm={() => setActiveModal("consentForm")}
        onViewForm={(id: string) => {
          const f = consentForms.find((x: any) => x.id === id);
          if (f) {
            setSelectedConsentForm(f);
            setActiveModal("consentViewer");
          }
        }}
        onDeleteForm={(id: string) =>
          confirmDelete(
            "Delete Consent Form",
            "Delete this consent form?",
            () => handleDeleteConsentForm(id),
          )
        }
      />
    </div>
  );
}
