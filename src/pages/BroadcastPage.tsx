import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Button,
  Textarea,
  Checkbox,
  SearchInput,
  Pagination,
  Modal,
  StatusBadge,
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

const PAGE_SIZE = 25;
const MAX_MESSAGE = 900;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const rowKey = (r: BroadcastRecipient) => `${r.source}:${r.id}`;

export function BroadcastPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, BroadcastRecipient>>(
    new Map(),
  );
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<SendBroadcastResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

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

  const toggleOne = (r: BroadcastRecipient) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const k = rowKey(r);
      if (next.has(k)) next.delete(k);
      else next.set(k, r);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allOnPageSelected) {
        pageSelectable.forEach((r) => next.delete(rowKey(r)));
      } else {
        pageSelectable.forEach((r) => next.set(rowKey(r), r));
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Map());

  const handleImage = (file: File) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Image must be a JPG or PNG");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image exceeds the 5 MB limit");
      return;
    }
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const selectedCount = selected.size;
  const trimmedMessage = message.trim();
  const canSend =
    selectedCount > 0 && trimmedMessage.length > 0 && !sendMutation.isPending;

  const doSend = async () => {
    const picked = [...selected.values()];
    const patientIds = picked
      .filter((r) => r.source === "patient")
      .map((r) => r.id);
    const memberIds = picked
      .filter((r) => r.source === "member")
      .map((r) => r.id);

    try {
      const raw: any = await sendMutation.mutateAsync({
        messageBody: trimmedMessage,
        patientIds,
        memberIds,
        imageFile,
      });
      // useApiMutation returns responseObject, which may or may not be wrapped
      // in a `data` envelope depending on the endpoint.
      const res: SendBroadcastResponse =
        raw && typeof raw.queued === "number" ? raw : raw?.data ?? raw;
      setResult(res);
      setConfirmOpen(false);
      toast.success(`Broadcast queued for ${res?.queued ?? 0} recipient(s)`);
      clearSelection();
    } catch (err: any) {
      setConfirmOpen(false);
      toast.error(err?.message || "Failed to queue broadcast");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader
        title="WhatsApp Broadcast"
        subtitle="Send a one-time wishing message to selected patients and members"
      />

      {result && (
        <Card className="p-4 border-emerald-200 bg-emerald-50/50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Queued for {result.queued ?? 0} recipient(s)
                {result.hasImage ? " with image" : ""}.
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
            <button
              onClick={() => setResult(null)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recipient picker ─────────────────────────────── */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Recipients</h2>
              {selectedCount > 0 && (
                <StatusBadge variant="blue">{selectedCount} selected</StatusBadge>
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
            <label
              htmlFor="select-page"
              className="text-xs font-medium text-muted-foreground cursor-pointer"
            >
              Select all on this page ({pageSelectable.length})
            </label>
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
                      <label
                        htmlFor={`r-${k}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <span className="block text-sm font-medium text-foreground truncate">
                          {r.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {noPhone
                            ? "No phone number"
                            : `${r.country_code ?? ""} ${r.phone}`}
                        </span>
                      </label>
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

        {/* ── Message + image ──────────────────────────────── */}
        <Card className="flex flex-col p-4 gap-4 h-fit">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Message</h2>
          </div>

          <div>
            <Textarea
              value={message}
              autoCapitalizeWords={false}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              placeholder="Wishing you and your family a very Happy Janmashtami! May Lord Krishna fill your life with happiness, good health and countless reasons to smile."
              className="min-h-[150px] text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-muted-foreground">
                Sent as “Dear &lt;name&gt;,” then your message.
              </p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">
              Image{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImage(f);
              }}
            />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Broadcast attachment"
                  className="w-full max-h-52 object-contain bg-muted"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">
                  Click to add a JPG or PNG
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Max 5 MB
                </p>
              </button>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!canSend}
            onClick={() => setConfirmOpen(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            Send broadcast
          </Button>
          {selectedCount === 0 && (
            <p className="text-[11px] text-muted-foreground text-center -mt-2">
              Select at least one recipient
            </p>
          )}
        </Card>
      </div>

      {confirmOpen && (
        <Modal
          title="Send this broadcast?"
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
                    Sending…
                  </span>
                ) : (
                  `Send to ${selectedCount}`
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              A WhatsApp template message will be queued for{" "}
              <span className="font-semibold text-foreground">
                {selectedCount}
              </span>{" "}
              recipient(s)
              {imageFile ? " with the attached image" : ""}.
            </p>
            <div className="rounded-lg bg-[#e7ffdb] text-slate-800 border border-emerald-200 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              Dear &lt;name&gt;, {trimmedMessage}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default BroadcastPage;
