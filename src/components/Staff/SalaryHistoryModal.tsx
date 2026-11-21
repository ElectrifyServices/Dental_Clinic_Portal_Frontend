import { Calendar, IndianRupee, History, Loader2 } from "lucide-react";
import { Modal, Button, Badge } from "@/components/ui";
import { useSalaryHistoryQuery } from "../../hooks/staff/useSalaryHistoryQuery";

interface SalaryHistoryModalProps {
  staffId: string;
  staffName: string;
  onClose: () => void;
}

export function SalaryHistoryModal({
  staffId,
  staffName,
  onClose,
}: SalaryHistoryModalProps) {
  const { data: responseData, isLoading } = useSalaryHistoryQuery(staffId);
  const historyData = responseData?.responseObject?.data || responseData?.responseObject || responseData?.data || responseData || [];
  const history = Array.isArray(historyData) ? historyData : (Array.isArray(historyData?.data) ? historyData.data : []);

  return (
    <Modal
      title="Salary History"
      subtitle={staffName}
      onClose={onClose}
      size="md"
      icon={<History className="w-4 h-4" />}
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={onClose}>
            Close History
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <History className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              No transactions recorded
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((payment: any, index: number) => {
              const amount = payment.payment_amount || payment.amount || 0;
              const date = payment.payment_date || payment.date || new Date().toISOString();
              const mode = payment.payment_mode || payment.mode || "Unknown";
              const note = payment.disbursement_note || payment.note || "";

              return (
              <div
                key={index}
                className="p-4 border border-border rounded-2xl bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <IndianRupee className="w-5 h-5 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-foreground">
                        ₹{amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-wider mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="gray"
                    className="text-[9px] font-black tracking-widest uppercase px-2"
                  >
                    {mode}
                  </Badge>
                </div>
                {note && (
                  <div className="mt-3 pl-13 text-[11px] text-muted-foreground font-medium border-l-2 border-border ml-[52px] py-0.5">
                    "{note}"
                  </div>
                )}
              </div>
            )})}
          </div>
        )}
      </div>
    </Modal>
  );
}
