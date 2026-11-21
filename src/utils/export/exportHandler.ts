export const downloadExcelFromBlob = async (blobData: any, filename: string) => {
  let finalBlob = blobData;

  // Handle case where backend returns a JSON-encoded binary string inside a Blob
  if (blobData instanceof Blob) {
    const text = await blobData.text();
    // If it starts and ends with quotes, it might be a JSON-encoded string
    if (text.startsWith('"') && text.endsWith('"') && text.includes('PK')) {
      try {
        const binaryString = JSON.parse(text);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i) & 0xff;
        }
        finalBlob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      } catch (e) {
        console.warn("Failed to parse JSON string to binary", e);
      }
    } else {
      finalBlob = new Blob([blobData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    }
  } else {
    finalBlob = new Blob([blobData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }
  
  const url = window.URL.createObjectURL(finalBlob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
  window.URL.revokeObjectURL(url);
};


