import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  CheckCircle,
  Activity,
  Stethoscope,
  Pill,
  FileText,
  File,
} from "lucide-react";
import { PDFReportType } from "../../../utils/pdfGenerator";

interface CompletionViewProps {
  onDownloadPDF: (type: PDFReportType) => void;
  onClose: () => void;
}

export function CompletionView({
  onDownloadPDF,
  onClose,
}: CompletionViewProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Card className="text-center shadow-lg border-primary/10">
        <CardHeader className="pt-10 pb-6 space-y-4">
          <div className="mx-auto bg-green-100/50 text-green-600 rounded-full p-6 w-fit ring-8 ring-green-50">
            <CheckCircle className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-bold">Consultation Completed!</CardTitle>
          <CardDescription className="text-lg">
            All clinical records and prescriptions have been securely saved to the patient's history.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            
            <Card 
              className="cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors group"
              onClick={() => onDownloadPDF("CLINICAL")}
            >
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg text-foreground">Clinical Report</div>
                  <div className="text-sm text-muted-foreground">Observations &amp; Chart</div>
                </div>
                <File className="w-5 h-5 text-muted-foreground group-hover:text-blue-500" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-colors group"
              onClick={() => onDownloadPDF("TREATMENT")}
            >
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg text-foreground">Treatment Plan</div>
                  <div className="text-sm text-muted-foreground">Procedures &amp; Costs</div>
                </div>
                <File className="w-5 h-5 text-muted-foreground group-hover:text-purple-500" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors group"
              onClick={() => onDownloadPDF("PRESCRIPTION")}
            >
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg text-foreground">Prescription</div>
                  <div className="text-sm text-muted-foreground">Medicines &amp; Dosage</div>
                </div>
                <File className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500" />
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors group"
              onClick={() => onDownloadPDF("FULL")}
            >
              <CardContent className="flex items-center gap-5 p-6">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg text-foreground">Full Report</div>
                  <div className="text-sm text-muted-foreground">Complete Document</div>
                </div>
                <File className="w-5 h-5 text-muted-foreground group-hover:text-orange-500" />
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onClose}
          className="px-12 py-6 text-lg rounded-xl shadow-md"
        >
          {"Done & Close Window"}
        </Button>
      </div>
    </div>
  );
}
