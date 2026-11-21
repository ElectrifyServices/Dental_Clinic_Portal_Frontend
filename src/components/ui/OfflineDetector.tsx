import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "./Toast";

type ConnectionState = "online" | "offline" | "checking" | "restored";

export function OfflineDetector() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    navigator.onLine ? "online" : "offline"
  );
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      // Trigger a connection check to verify actual internet access
      verifyConnection();
    };

    const handleOffline = () => {
      setConnectionState("offline");
      setIsOffline(true);
      toast.error("You are currently offline.", { id: "offline-toast" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check in case window status is out of sync
    if (!navigator.onLine) {
      setConnectionState("offline");
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const verifyConnection = async () => {
    setConnectionState("checking");
    setIsOffline(true);

    try {
      // Use cache buster to bypass browser cache
      const response = await fetch(
        `${window.location.origin}/index.html?t=${Date.now()}`,
        {
          method: "HEAD",
          cache: "no-store",
        }
      );

      if (response.ok || response.status < 400) {
        setConnectionState("restored");
        toast.success("Connection restored!");
        
        // Hide the banner after 2 seconds
        setTimeout(() => {
          setConnectionState("online");
          setIsOffline(false);
        }, 2000);
      } else {
        throw new Error("Server response invalid");
      }
    } catch (error) {
      setConnectionState("offline");
      setIsOffline(true);
      toast.error("Still offline. Please check your internet connection.");
    }
  };

  if (connectionState === "online") return null;

  // Determine styling based on connection state
  let cardBorderClass = "border-destructive/20 shadow-[0_8px_30px_rgb(239,68,68,0.15)]";
  let statusIcon = <WifiOff className="w-5 h-5 text-destructive animate-pulse" />;
  let title = "Connection Lost";
  let message = "You are currently offline. Changes may not be saved.";
  let bgGradient = "bg-destructive/5";

  if (connectionState === "checking") {
    cardBorderClass = "border-amber-500/20 shadow-[0_8px_30px_rgb(245,158,11,0.15)]";
    statusIcon = <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
    title = "Verifying Connection";
    message = "Checking internet connection, please wait...";
    bgGradient = "bg-amber-500/5";
  } else if (connectionState === "restored") {
    cardBorderClass = "border-emerald-500/20 shadow-[0_8px_30px_rgb(16,185,129,0.15)]";
    statusIcon = <Wifi className="w-5 h-5 text-emerald-500 animate-bounce" />;
    title = "Back Online";
    message = "Connection successfully restored. Syncing...";
    bgGradient = "bg-emerald-50/10 dark:bg-emerald-950/10";
  }

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-500 ease-out",
        isOffline ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "glass-panel rounded-2xl p-4 flex gap-4 items-start border shadow-xl relative overflow-hidden",
          cardBorderClass
        )}
      >
        {/* State indicator top border highlight */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
            connectionState === "offline" && "bg-destructive",
            connectionState === "checking" && "bg-amber-500",
            connectionState === "restored" && "bg-emerald-500"
          )}
        />

        {/* Soft background glow matching state */}
        <div className={cn("absolute inset-0 opacity-30 -z-10", bgGradient)} />

        {/* Icon wrapper */}
        <div className="p-2.5 bg-muted rounded-xl shrink-0">
          {statusIcon}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground leading-tight mb-0.5">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-normal font-medium">
            {message}
          </p>
        </div>

        {/* Action button */}
        {connectionState !== "restored" && (
          <button
            onClick={verifyConnection}
            disabled={connectionState === "checking"}
            className={cn(
              "btn-secondary py-1.5 px-3 text-xs shrink-0 select-none",
              connectionState === "checking" && "opacity-50 cursor-not-allowed"
            )}
          >
            {connectionState === "checking" ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Retrying...
              </span>
            ) : (
              "Retry"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
