import React from 'react';
import { Download, FileText, User, Calendar, Stethoscope, Camera } from 'lucide-react';
import { Modal, Badge, Button, Card, CardHeader, CardTitle, CardContent, SearchInput, FilterTabs } from '@/components/ui';

interface EMRViewerProps {
  record: any;
  onClose: () => void;
}

export function EMRViewer({ record, onClose }: EMRViewerProps) {
  if (!record) return null;

  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');

  const TIMELINE_FILTERS = [
    { key: 'all', label: 'All History' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'treatment', label: 'Treatments' },
    { key: 'consultation', label: 'Consultations' },
    { key: 'prescription', label: 'Prescriptions' },
    { key: 'billing', label: 'Billing' },
  ];

  const filteredTimeline = React.useMemo(() => {
    if (!record.timeline) return null;
    return record.timeline.filter((item: any) => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(search.toLowerCase()) || 
        item.content?.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || item.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [record.timeline, search, activeTab]);

  const handleDownload = () => {
    const printContent = `
      <html>
        <head>
          <title>EMR Record - ${record.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .record-info { background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .content { white-space: pre-wrap; margin-bottom: 30px; padding: 20px; background: #fff; border-radius: 8px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            h1, h2, h3 { color: #1e3a8a; }
            strong { color: #334155; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Electronic Medical Record</h1>
            <h2>DentalCare Pro - Dr. Sharma's Clinic</h2>
          </div>
          
          <div class="record-info">
            <h3 style="margin-top:0">Record Information</h3>
            <p><strong>Patient:</strong> ${record.patientName}</p>
            <p><strong>Title:</strong> ${record.title}</p>
            <p><strong>Date:</strong> ${new Date(record.date).toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> ${record.doctorName}</p>
            <p><strong>Type:</strong> ${record.type.toUpperCase()}</p>
          </div>

          <div class="content">
            <h3>Medical Record Content</h3>
            ${record.content}
          </div>

          <div class="footer">
            <p>This is a confidential medical document generated from DentalCare Pro EMR System</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emr-${record.patientName}-${record.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title={record.patientName}
      onClose={onClose}
      size="2xl"
      icon={<FileText className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Patient Summary Card */}
        <Card className="border-primary/10 bg-primary/5 overflow-hidden">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
              <User className="w-4 h-4" /> Patient Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Patient</p>
                <p className="font-bold text-foreground text-sm">{record.patientName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Date Recorded</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="font-medium text-foreground text-sm">{new Date(record.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Type</p>
                <Badge variant="blue" className="capitalize text-[10px]">{(record.type || 'consultation').replace('-', ' ')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Timeline */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Medical History Details
            </h3>
            {record.timeline && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                {filteredTimeline?.length || 0} Records Found
              </span>
            )}
          </div>

          {record.timeline ? (
            <div className="space-y-3">
              {/* Search and Filters */}
              <div className="flex flex-col gap-3">
                <SearchInput 
                  value={search}
                  onChange={setSearch}
                  placeholder="Search in clinical notes, procedures..."
                  className="w-full"
                />
                <div className="overflow-x-auto pb-1 -mx-1 px-1 flex">
                  <FilterTabs 
                    tabs={TIMELINE_FILTERS}
                    active={activeTab}
                    onChange={setActiveTab}
                  />
                </div>
              </div>

              <div className="pt-2">
                {filteredTimeline && filteredTimeline.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {filteredTimeline.map((item: any, idx: number) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary ring-4 ring-primary/10 transition-transform group-hover:scale-125" />
                        <div className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground text-sm">{item.title}</span>
                            <time className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {new Date(item.date).toLocaleDateString()}
                            </time>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-foreground">No records match your criteria</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setActiveTab('all'); }} className="mt-4 text-xs font-bold text-primary">
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="font-bold text-foreground mb-3">{record.title}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {record.content}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Attachments Section */}
        {record.attachments && record.attachments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
              <Camera className="w-4 h-4 text-primary" /> Digital Attachments ({record.attachments.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {record.attachments.map((attachment: string, index: number) => (
                <div key={index} className="group relative">
                  <div className="aspect-square bg-muted rounded-xl border border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group-hover:shadow-md">
                    <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground mt-2 truncate w-full px-2 text-center">
                      {attachment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
