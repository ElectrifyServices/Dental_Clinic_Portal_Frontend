import { useMutation } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";

export function useExportInvoicesMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/invoice/export', {
        format: 'xlsx'
      }, {
        responseType: 'blob', // Important for downloading files
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a link element, use it to download the blob, and then remove it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response.data;
    },
  });
}
