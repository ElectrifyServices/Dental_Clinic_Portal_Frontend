import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Loading } from "@/components/ui";
import { useCalendarCallbackMutation } from "@/hooks/calendarIntegration/useCalendarCallbackMutation";

export const CalendarIntegrationCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: submitCallback } = useCalendarCallbackMutation();
  const hasFired = useRef(false);
  const [outcome, setOutcome] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const provider = params.get("source") || "google";

    if (!code || !state) {
      navigate("/calendar-integration", { replace: true });
      return;
    }

    submitCallback({ provider, code, state })
      .then(() => {
        setOutcome("success");
        setTimeout(() => navigate("/calendar-integration?connected=1", { replace: true }), 1500);
      })
      .catch(() => {
        setOutcome("error");
        setTimeout(() => navigate("/calendar-integration?connected=0", { replace: true }), 1500);
      });
  }, []);

  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="flex flex-col items-center text-center gap-4 max-w-sm">
        {outcome === "pending" && (
          <>
            <Loading type="spinner" />
            <p className="text-sm font-medium text-muted-foreground">Connecting your Google Calendar…</p>
          </>
        )}
        {outcome === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-sm font-semibold text-foreground">Google Calendar connected</p>
            <p className="text-xs text-muted-foreground">Taking you back to settings…</p>
          </>
        )}
        {outcome === "error" && (
          <>
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Couldn't connect your calendar</p>
            <p className="text-xs text-muted-foreground">Taking you back to settings…</p>
          </>
        )}
      </div>
    </div>
  );
};
