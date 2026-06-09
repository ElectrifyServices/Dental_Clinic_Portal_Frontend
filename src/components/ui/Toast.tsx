import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";

// Export standard toast object to trigger toast notifications
export const toast = hotToast;

// Pre-configured premium Toaster component matching the application design system
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Define default options with explicit professional high-contrast colors
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#0f172a", // Slate 900 for clean readable text
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981", // Emerald 500
            secondary: "#ffffff",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444", // Red 500
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
