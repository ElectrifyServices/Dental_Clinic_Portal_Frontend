import { useEffect, useMemo, useState } from "react";
import {
  Send,
  X,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  FileText,
  Megaphone,
  Image as ImageIcon,
  Clock,
  CalendarClock,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Checkbox,
  SearchInput,
  Pagination,
  Modal,
  StatusBadge,
  Label,
  Input,
  Switch,
  toast,
} from "../components/ui";
import {
  useBroadcastRecipientsQuery,
  normalizeRecipients,
  type BroadcastRecipient,
} from "../hooks/broadcast/useBroadcastRecipientsQuery";
import {
  useSendBroadcastMutation,
  type SendBroadcastResponse,
} from "../hooks/broadcast/useSendBroadcastMutation";
import {
  useBroadcastTemplatesQuery,
  useRefreshBroadcastTemplateMutation,
  useDeleteBroadcastTemplateMutation,
  type BroadcastTemplate,
  type BroadcastTemplateStatus,
} from "../hooks/broadcast/useBroadcastTemplates";
import { WaTextPreview } from "../components/broadcast/WaTextPreview";
import { TemplateFormModal } from "../components/broadcast/TemplateFormModal";
import {
  useScheduledBroadcastsQuery,
  useCancelScheduledBroadcastMutation,
  type ScheduledBroadcast,
} from "../hooks/broadcast/useScheduledBroadcasts";

const PAGE_SIZE = 25;
const rowKey = (r: BroadcastRecipient) => `${r.source}:${r.id}`;

const STATUS_VARIANT: Record<
  BroadcastTemplateStatus,
  "green" | "amber" | "red" | "gray"
> = {
  APPROVED: "green",
  PENDING: "amber",
  DRAFT: "gray",
  REJECTED: "red",
  PAUSED: "amber",
  DISABLED: "gray",
};

const STATUS_LABEL: Record<BroadcastTemplateStatus, string> = {
  APPROVED: "Approved",
  PENDING: "Pending review",
  DRAFT: "Draft",
  REJECTED: "Rejected",
  PAUSED: "Paused",
  DISABLED: "Disabled",
};

export function BroadcastPage() {
  const [view, setView] = useState<"send" | "templates" | "scheduled">("send");
  const [showCreate, setShowCreate] = useState(false);

  const templatesQuery = useBroadcastTemplatesQuery();
  const { refetch: refetchTemplates } = templatesQuery;

  // templatesQuery lives here in the parent, which never unmounts across tab
  // switches, so refetchOnMount alone can't re-trigger it — refetch it
  // explicitly whenever the user switches onto a tab that depends on it.
  useEffect(() => {
    if (view === "send" || view === "templates") {
      refetchTemplates();
    }
  }, [view, refetchTemplates]);

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data],
  );
  const approved = useMemo(
    () => templates.filter((t) => t.status === "APPROVED"),
    [templates],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader
        title="WhatsApp Broadcast"
        subtitle="Send a wishing message to selected patients and members"
      />

      <div className="inline-flex rounded-lg bg-muted p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("send")}
          className={`text-sm font-semibold ${
            view === "send"
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Send broadcast
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("templates")}
          className={`text-sm font-semibold ${
            view === "templates"
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Templates
          {templates.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({templates.length})
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("scheduled")}
          className={`text-sm font-semibold ${
            view === "scheduled"
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground"
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Scheduled
        </Button>
      </div>

      {view === "send" ? (
        <SendView
          approved={approved}
          loadingTemplates={templatesQuery.isLoading}
          onGoToTemplates={() => setView("templates")}
        />
      ) : view === "templates" ? (
        <TemplatesView
          templates={templates}
          loading={templatesQuery.isLoading}
          onNew={() => setShowCreate(true)}
        />
      ) : (
        <ScheduledView />
      )}

      {showCreate && (
        <TemplateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            templatesQuery.refetch();
            setView("templates");
          }}
        />
      )}
    </div>
  );
}

/* ── Send view ──────────────────────────────────────────────────────────── */

function SendView({
  approved,
  loadingTemplates,
  onGoToTemplates,
}: {
  approved: BroadcastTemplate[];
  loadingTemplates: boolean;
  onGoToTemplates: () => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, BroadcastRecipient>>(
    new Map(),
  );
  const [templateName, setTemplateName] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<SendBroadcastResponse | null>(null);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!templateName && approved.length === 1) setTemplateName(approved[0].name);
  }, [approved, templateName]);

  const { data, isFetching } = useBroadcastRecipientsQuery({
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });
  const { rows, total } = useMemo(() => normalizeRecipients(data), [data]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sendMutation = useSendBroadcastMutation();

  const withPhone = (r: BroadcastRecipient) => Boolean((r.phone ?? "").trim());
  const pageSelectable = rows.filter(withPhone);
  const allOnPageSelected =
    pageSelectable.length > 0 &&
    pageSelectable.every((r) => selected.has(rowKey(r)));

  const toggleOne = (r: BroadcastRecipient) =>
    setSelected((prev) => {
      const next = new Map(prev);
      const k = rowKey(r);
      if (next.has(k)) next.delete(k);
      else next.set(k, r);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (allOnPageSelected)
        pageSelectable.forEach((r) => next.delete(rowKey(r)));
      else pageSelectable.forEach((r) => next.set(rowKey(r), r));
      return next;
    });

  const clearSelection = () => setSelected(new Map());

  const selectedCount = selected.size;
  const chosenTemplate = approved.find((t) => t.name === templateName);

  // Combine the date + time inputs into an ISO string in the browser's local
  // time (clinic staff work in IST, same as the rest of this app's pickers).
  const scheduledAtISO =
    scheduleLater && scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
      : undefined;
  const scheduleInPast =
    scheduleLater &&
    Boolean(scheduledAtISO) &&
    new Date(scheduledAtISO as string).getTime() <= Date.now();

  const canSend =
    selectedCount > 0 &&
    Boolean(chosenTemplate) &&
    !sendMutation.isPending &&
    (!scheduleLater || (Boolean(scheduledAtISO) && !scheduleInPast));

  const doSend = async () => {
    const picked = [...selected.values()];
    try {
      const raw = (await sendMutation.mutateAsync({
        templateName,
        patientIds: picked.filter((r) => r.source === "patient").map((r) => r.id),
        memberIds: picked.filter((r) => r.source === "member").map((r) => r.id),
        scheduledAt: scheduledAtISO,
      })) as SendBroadcastResponse & { data?: SendBroadcastResponse };
      const res: SendBroadcastResponse =
        raw && typeof raw.queued === "number" ? raw : (raw?.data ?? raw);
      setResult(res);
      setConfirmOpen(false);
      toast.success(
        res?.scheduledBroadcastId
          ? `Broadcast scheduled for ${res?.queued ?? 0} recipient(s)`
          : `Broadcast queued for ${res?.queued ?? 0} recipient(s)`,
      );
      clearSelection();
      if (scheduleLater) {
        setScheduleLater(false);
        setScheduleDate("");
        setScheduleTime("");
      }
    } catch (err) {
      setConfirmOpen(false);
      toast.error(
        err instanceof Error ? err.message : "Failed to queue broadcast",
      );
    }
  };

  if (!loadingTemplates && approved.length === 0) {
    return (
      <Card className="p-10 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">
          No approved templates yet
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
          Create a festival wish template and wait for WhatsApp to approve it —
          then you can broadcast it here.
        </p>
        <Button onClick={onGoToTemplates}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create a template
        </Button>
      </Card>
    );
  }

  return (
    <>
      {result && (
        <Card className="p-4 border-emerald-200 bg-emerald-50/50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {result.scheduledBroadcastId
                  ? `Scheduled for ${result.queued ?? 0} recipient(s)${
                      result.scheduledAt
                        ? ` at ${new Date(result.scheduledAt).toLocaleString(
                            "en-IN",
                            { dateStyle: "medium", timeStyle: "short" },
                          )}`
                        : ""
                    }.`
                  : `Queued for ${result.queued ?? 0} recipient(s).`}
              </p>
              {(result.skipped?.length ?? 0) > 0 && (
                <details className="mt-2">
                  <summary className="text-xs font-semibold text-amber-700 cursor-pointer">
                    {result.skipped.length} skipped
                  </summary>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    {result.skipped.map((s, i) => (
                      <li key={`${s.id}-${i}`}>
                        {s.name || s.id} — {s.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Track delivery under Notifications (event “Festival Broadcast”).
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setResult(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Recipients
              </h2>
              {selectedCount > 0 && (
                <StatusBadge variant="blue">
                  {selectedCount} selected
                </StatusBadge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              )}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search name or phone…"
                className="w-56"
              />
            </div>
          </div>

          <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-3">
            <Checkbox
              checked={allOnPageSelected}
              onCheckedChange={togglePage}
              disabled={pageSelectable.length === 0}
              id="select-page"
            />
            <Label
              htmlFor="select-page"
              className="text-xs font-medium text-muted-foreground cursor-pointer"
            >
              Select all on this page ({pageSelectable.length})
            </Label>
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-[280px] max-h-[52vh]">
            {rows.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No patients or members found.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((r) => {
                  const k = rowKey(r);
                  const noPhone = !withPhone(r);
                  return (
                    <li
                      key={k}
                      className={`flex items-center gap-3 px-4 py-2.5 ${
                        noPhone ? "opacity-50" : "hover:bg-muted/30"
                      }`}
                    >
                      <Checkbox
                        checked={selected.has(k)}
                        onCheckedChange={() => toggleOne(r)}
                        disabled={noPhone}
                        id={`r-${k}`}
                      />
                      <Label
                        htmlFor={`r-${k}`}
                        className="flex-1 min-w-0 cursor-pointer font-normal"
                      >
                        <span className="block text-sm font-medium text-foreground truncate">
                          {r.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {noPhone
                            ? "No phone number"
                            : `${r.country_code ?? ""} ${r.phone}`}
                        </span>
                      </Label>
                      <StatusBadge
                        variant={r.source === "patient" ? "violet" : "indigo"}
                      >
                        {r.source}
                      </StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              perPage={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </Card>

        <Card className="flex flex-col p-4 gap-4 h-fit">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Template</h2>
          </div>

          <div>
            <select
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select an approved template…</option>
              {approved.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.occasion}
                </option>
              ))}
            </select>
          </div>

          {chosenTemplate && (
            <div className="rounded-xl bg-[#efe7de] p-3">
              {chosenTemplate.header_type === "IMAGE" && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Includes a header image
                </div>
              )}
              <WaTextPreview
                text={
                  (chosenTemplate.body_variable_count >= 1
                    ? chosenTemplate.body_text.replace("{{1}}", "Priya")
                    : chosenTemplate.body_text) +
                  (chosenTemplate.footer_text
                    ? `\n\n${chosenTemplate.footer_text}`
                    : "")
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <Label
              htmlFor="schedule-later"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Schedule for later
            </Label>
            <Switch
              id="schedule-later"
              checked={scheduleLater}
              onCheckedChange={(v) => setScheduleLater(Boolean(v))}
            />
          </div>

          {scheduleLater && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </label>
                <Input
                  type="date"
                  value={scheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Time
                </label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              {scheduleInPast && (
                <p className="col-span-2 text-[11px] text-red-600">
                  Pick a time in the future
                </p>
              )}
            </div>
          )}

          <Button
            className="w-full"
            disabled={!canSend}
            onClick={() => setConfirmOpen(true)}
          >
            {scheduleLater ? (
              <CalendarClock className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {scheduleLater ? "Schedule broadcast" : "Send broadcast"}
          </Button>
          {selectedCount === 0 && (
            <p className="text-[11px] text-muted-foreground text-center -mt-2">
              Select at least one recipient
            </p>
          )}
        </Card>
      </div>

      {confirmOpen && chosenTemplate && (
        <Modal
          title={
            scheduleLater ? "Schedule this broadcast?" : "Send this broadcast?"
          }
          size="sm"
          onClose={() => !sendMutation.isPending && setConfirmOpen(false)}
          icon={<AlertTriangle className="w-4 h-4 text-primary" />}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={sendMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={doSend} disabled={sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {scheduleLater ? "Scheduling…" : "Sending…"}
                  </span>
                ) : scheduleLater ? (
                  `Schedule for ${selectedCount}`
                ) : (
                  `Send to ${selectedCount}`
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {scheduleLater && scheduledAtISO ? (
                <>
                  “{chosenTemplate.occasion}” will be sent to{" "}
                  <span className="font-semibold text-foreground">
                    {selectedCount}
                  </span>{" "}
                  recipient(s) at{" "}
                  <span className="font-semibold text-foreground">
                    {new Date(scheduledAtISO).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  .
                </>
              ) : (
                <>
                  “{chosenTemplate.occasion}” will be queued for{" "}
                  <span className="font-semibold text-foreground">
                    {selectedCount}
                  </span>{" "}
                  recipient(s).
                </>
              )}
            </p>
            <WaTextPreview
              text={
                (chosenTemplate.body_variable_count >= 1
                  ? chosenTemplate.body_text.replace("{{1}}", "<name>")
                  : chosenTemplate.body_text) +
                (chosenTemplate.footer_text
                  ? `\n\n${chosenTemplate.footer_text}`
                  : "")
              }
            />
          </div>
        </Modal>
      )}
    </>
  );
}

/* ── Templates view ────────────────────────────────────────────────────── */

function TemplatesView({
  templates,
  loading,
  onNew,
}: {
  templates: BroadcastTemplate[];
  loading: boolean;
  onNew: () => void;
}) {
  const refreshMutation = useRefreshBroadcastTemplateMutation();
  const deleteMutation = useDeleteBroadcastTemplateMutation();
  const [confirmDelete, setConfirmDelete] = useState<BroadcastTemplate | null>(
    null,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onNew}>
          <Plus className="w-4 h-4 mr-1.5" />
          New template
        </Button>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading templates…
        </Card>
      ) : templates.length === 0 ? (
        <Card className="p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No templates yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a festival wish template to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {t.occasion}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    {t.name}
                  </p>
                </div>
                <StatusBadge variant={STATUS_VARIANT[t.status]}>
                  {STATUS_LABEL[t.status]}
                </StatusBadge>
              </div>

              <WaTextPreview
                text={
                  (t.body_variable_count >= 1
                    ? t.body_text.replace("{{1}}", "Priya")
                    : t.body_text) +
                  (t.footer_text ? `\n\n${t.footer_text}` : "")
                }
                className="max-h-40 overflow-y-auto"
              />

              {t.status === "REJECTED" && t.rejected_reason && (
                <p className="text-[11px] text-red-600">
                  Rejected: {t.rejected_reason}
                </p>
              )}

              <div className="flex items-center gap-2 mt-auto pt-1">
                {t.header_type === "IMAGE" && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Image
                  </span>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  {t.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={refreshMutation.isPending}
                      onClick={() =>
                        refreshMutation
                          .mutateAsync({ id: t.id })
                          .then((r) => {
                            const s = (r as BroadcastTemplate | undefined)
                              ?.status;
                            toast.success(
                              s === "APPROVED"
                                ? "Approved!"
                                : s === "REJECTED"
                                  ? "Rejected by WhatsApp"
                                  : "Still pending review",
                            );
                          })
                          .catch((e) =>
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : "Could not refresh",
                            ),
                          )
                      }
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          refreshMutation.isPending ? "animate-spin" : ""
                        }`}
                      />
                      <span className="ml-1">Refresh</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(t)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmDelete && (
        <Modal
          title="Delete this template?"
          size="sm"
          onClose={() => !deleteMutation.isPending && setConfirmDelete(null)}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteMutation
                    .mutateAsync({ id: confirmDelete.id })
                    .then(() => {
                      toast.success("Template deleted");
                      setConfirmDelete(null);
                    })
                    .catch((e) =>
                      toast.error(
                        e instanceof Error ? e.message : "Could not delete",
                      ),
                    )
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            “{confirmDelete.occasion}” will be removed from WhatsApp and this
            list. Broadcasts already queued are unaffected.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ── Scheduled view ────────────────────────────────────────────────────── */

function ScheduledView() {
  const { data, isLoading } = useScheduledBroadcastsQuery();
  const scheduled = data ?? [];
  const cancelMutation = useCancelScheduledBroadcastMutation();
  const [confirmCancel, setConfirmCancel] =
    useState<ScheduledBroadcast | null>(null);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          Loading scheduled broadcasts…
        </Card>
      ) : scheduled.length === 0 ? (
        <Card className="p-10 text-center">
          <CalendarClock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No scheduled broadcasts
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pick “Schedule for later” while sending a broadcast to see it
            here.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {scheduled.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {s.templateName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.patientCount + s.memberCount} recipient(s) ·{" "}
                    {new Date(s.scheduledAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge
                    variant={
                      s.status === "SENT"
                        ? "green"
                        : s.status === "CANCELLED"
                          ? "gray"
                          : s.status === "FAILED"
                            ? "red"
                            : "amber"
                    }
                  >
                    {s.status}
                  </StatusBadge>
                  {s.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmCancel(s)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {confirmCancel && (
        <Modal
          title="Cancel this scheduled broadcast?"
          size="sm"
          onClose={() => !cancelMutation.isPending && setConfirmCancel(null)}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setConfirmCancel(null)}
                disabled={cancelMutation.isPending}
              >
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  cancelMutation
                    .mutateAsync({ id: confirmCancel.id })
                    .then(() => {
                      toast.success("Scheduled broadcast cancelled");
                      setConfirmCancel(null);
                    })
                    .catch((e) =>
                      toast.error(
                        e instanceof Error ? e.message : "Could not cancel",
                      ),
                    )
                }
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelling…" : "Cancel broadcast"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            “{confirmCancel.templateName}” will not be sent at its scheduled
            time.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default BroadcastPage;
