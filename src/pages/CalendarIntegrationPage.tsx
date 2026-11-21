import React, { useState } from "react";
import { CalendarDays, AlertTriangle, RefreshCw, Mail } from "lucide-react";
import {
  PageHeader,
  ContentCard,
  Button,
  Switch,
  StatusBadge,
  Loading,
  ErrorState,
  ConfirmModal,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  toast,
} from "@/components/ui";
import { useCalendarIntegrationsQuery } from "@/hooks/calendarIntegration/useCalendarIntegrationsQuery";
import { useConnectCalendarMutation } from "@/hooks/calendarIntegration/useConnectCalendarMutation";
import { useToggleCalendarSyncMutation } from "@/hooks/calendarIntegration/useToggleCalendarSyncMutation";
import { useDisconnectCalendarMutation } from "@/hooks/calendarIntegration/useDisconnectCalendarMutation";
import type { CalendarIntegration } from "@/types/calendarIntegration.types";

function formatSyncedAt(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return `${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

export const CalendarIntegrationPage: React.FC = () => {
  const { data: integrations, isLoading, isError, refetch } = useCalendarIntegrationsQuery();
  const { mutateAsync: connectCalendar, isPending: isConnecting } = useConnectCalendarMutation();
  const { mutateAsync: toggleSync, isPending: isToggling } = useToggleCalendarSyncMutation();
  const { mutateAsync: disconnectCalendar, isPending: isDisconnecting } = useDisconnectCalendarMutation();

  const [disconnectTarget, setDisconnectTarget] = useState<CalendarIntegration | null>(null);

  const google = (integrations || []).find((i) => i.provider === "GOOGLE") || null;
  const isGoogleConnected = !!google && google.status !== "DISABLED";

  const handleConnect = async () => {
    try {
      const { authUrl } = await connectCalendar("google");
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error(error?.message || "Failed to start Google Calendar connection");
    }
  };

  const handleToggleSync = async (checked: boolean) => {
    if (!google) return;
    try {
      await toggleSync({ id: google.id, sync_enabled: checked });
      toast.success(checked ? "Calendar sync enabled" : "Calendar sync paused");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update sync setting");
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    try {
      await disconnectCalendar({ id: disconnectTarget.id });
      toast.success("Google Calendar disconnected");
      setDisconnectTarget(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to disconnect calendar");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar Sync"
        subtitle="Connect your personal Google Calendar to auto-sync clinic appointments. Sync is one-way (clinic → Google) — edits made in Google Calendar are not pulled back."
      />

      {isLoading ? (
        <ContentCard>
          <Loading type="spinner" />
        </ContentCard>
      ) : isError ? (
        <ErrorState
          message={
            <div className="flex flex-col items-center gap-3">
              <span>Couldn't load your calendar connections.</span>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Google Calendar ─────────────────────────────────── */}
          <ContentCard
            title="Google Calendar"
            icon={<CalendarDays className="w-4.5 h-4.5" />}
            action={
              isGoogleConnected ? (
                google?.status === "NEEDS_REAUTH" ? (
                  <StatusBadge variant="amber">Needs Attention</StatusBadge>
                ) : (
                  <StatusBadge variant="green">Connected</StatusBadge>
                )
              ) : null
            }
          >
            {!isGoogleConnected ? (
              <div className="flex flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  Not connected yet. Connect your Google account so new, rescheduled, and cancelled appointments push to your calendar automatically.
                </p>
                <Button onClick={handleConnect} loading={isConnecting}>
                  Connect Google Calendar
                </Button>
              </div>
            ) : google?.status === "NEEDS_REAUTH" ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-800">
                      Connection needs attention
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Your Google authorization expired or was revoked. Reconnect to resume syncing.
                    </p>
                    {google.last_sync_error && (
                      <p className="text-[11px] text-amber-700/80 mt-1 break-words">
                        Last error: {google.last_sync_error}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={handleConnect} loading={isConnecting}>
                  Reconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{google?.external_account_email}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sync appointments</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last synced: {formatSyncedAt(google?.last_synced_at ?? null)}
                    </p>
                    {google?.last_sync_error && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-destructive mt-0.5 underline decoration-dotted cursor-help w-fit">
                              Last sync failed
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs py-1 px-2 font-semibold max-w-xs">
                            {google.last_sync_error}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Switch
                    checked={google?.sync_enabled ?? false}
                    disabled={isToggling}
                    onCheckedChange={handleToggleSync}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleConnect} loading={isConnecting} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => google && setDisconnectTarget(google)}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </ContentCard>

          {/* ── Outlook (coming soon) ───────────────────────────── */}
          <ContentCard
            title="Outlook / Microsoft 365"
            icon={<CalendarDays className="w-4.5 h-4.5" />}
            action={<StatusBadge variant="gray">Coming soon</StatusBadge>}
          >
            <p className="text-sm text-muted-foreground">
              Outlook calendar sync isn't available yet. We'll let you know when it's ready.
            </p>
          </ContentCard>
        </div>
      )}

      {disconnectTarget && (
        <ConfirmModal
          title="Disconnect Google Calendar"
          message={`This stops all future syncing to ${disconnectTarget.external_account_email}. Events already pushed to this calendar will not be deleted and will remain as history.`}
          confirmLabel="Disconnect"
          variant="danger"
          isLoading={isDisconnecting}
          onConfirm={handleDisconnect}
          onCancel={() => setDisconnectTarget(null)}
        />
      )}
    </div>
  );
};
