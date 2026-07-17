export type CalendarProvider = "GOOGLE" | "OUTLOOK";

export type CalendarIntegrationStatus = "ACTIVE" | "NEEDS_REAUTH" | "DISABLED";

export interface CalendarIntegration {
  id: string;
  provider: CalendarProvider;
  external_account_email: string;
  status: CalendarIntegrationStatus;
  sync_enabled: boolean;
  last_synced_at: string | null;
  last_sync_error: string | null;
  created_at: string;
}
