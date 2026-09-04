import { useRef, useState } from "react";
import { Image as ImageIcon, X, Loader2, Bold, Italic } from "lucide-react";
import { Button, Input, Textarea, Modal, Switch, toast } from "../ui";
import { WaTextPreview } from "./WaTextPreview";
import {
  useCreateBroadcastTemplateMutation,
  type BroadcastTemplate,
} from "../../hooks/broadcast/useBroadcastTemplates";

const MAX_BODY = 900;
const MAX_FOOTER = 60;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function balanced(text: string, marker: string): boolean {
  return (text.split(marker).length - 1) % 2 === 0;
}

export function TemplateFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: BroadcastTemplate) => void;
}) {
  const [occasion, setOccasion] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [includeName, setIncludeName] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const createMutation = useCreateBroadcastTemplateMutation();

  const wrapSelection = (marker: string) => {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const sel = body.slice(start, end) || "text";
    const next = body.slice(0, start) + marker + sel + marker + body.slice(end);
    setBody(next.slice(0, MAX_BODY));
  };

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

  const previewText =
    (includeName ? "Dear Priya,\n\n" : "") + body.trim() +
    (footer.trim() ? `\n\n${footer.trim()}` : "");

  const validate = (): string | null => {
    if (occasion.trim().length < 2) return "Give the occasion a name";
    if (!body.trim()) return "Write the wish message";
    for (const [m, label] of [
      ["*", "bold"],
      ["_", "italic"],
      ["~", "strikethrough"],
    ] as const) {
      if (!balanced(body, m))
        return `Unbalanced ${label} markers — every "${m}" needs a matching one`;
    }
    if ((includeName ? body.length + 12 : body.length) > 1024)
      return "Message is too long";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        occasion: occasion.trim(),
        bodyText: body.trim(),
        footerText: footer.trim() || undefined,
        includeName,
        imageFile,
      });
      toast.success("Template submitted for WhatsApp review");
      onCreated(created);
      onClose();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "WhatsApp rejected this template",
      );
    }
  };

  return (
    <Modal
      title="New broadcast template"
      subtitle="WhatsApp reviews new templates — usually approved within minutes to a few hours."
      size="2xl"
      onClose={() => !createMutation.isPending && onClose()}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Submit for review"
            )}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Occasion
            </label>
            <Input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value.slice(0, 120))}
              placeholder="e.g. Janmashtami 2026"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Message
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => wrapSelection("*")}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("_")}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <Textarea
              ref={bodyRef}
              value={body}
              autoCapitalizeWords={false}
              onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
              placeholder={
                "✨ *Happy Janmashtami!* ✨\nMay Lord Krishna fill your life with happiness, good health and countless reasons to smile. 💙"
              }
              className="min-h-[160px] text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-muted-foreground">
                Line breaks and *bold* / _italic_ are kept.
              </p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {body.length}/{MAX_BODY}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Personalise with recipient's name
              </p>
              <p className="text-[11px] text-muted-foreground">
                Prepends “Dear &lt;name&gt;,”
              </p>
            </div>
            <Switch
              checked={includeName}
              onCheckedChange={(v: boolean) => setIncludeName(v)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Footer{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              value={footer}
              onChange={(e) => setFooter(e.target.value.slice(0, MAX_FOOTER))}
              placeholder="Opal Smiles Dental Studio"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5">
              Header image{" "}
              <span className="font-normal text-muted-foreground">
                (optional — reused for every send)
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
                  alt="Header"
                  className="w-full max-h-44 object-contain bg-muted"
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
                className="w-full border-2 border-dashed border-border rounded-lg p-5 text-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-foreground">
                  Click to add a JPG or PNG
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Max 5 MB
                </p>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Preview</p>
          <div className="rounded-xl bg-[#efe7de] p-3">
            {imagePreview && (
              <img
                src={imagePreview}
                alt=""
                className="w-full max-h-40 object-cover rounded-lg mb-1.5"
              />
            )}
            <WaTextPreview text={previewText || "Your message…"} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            This is exactly what recipients see. Only the name changes per
            recipient.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default TemplateFormModal;
