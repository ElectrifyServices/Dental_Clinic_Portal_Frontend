import React from "react";

const COLORS = ["#0d9488", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#4f46e5"];

export const getInitials = (name?: string): string => {
  const parts = (name || "").replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const colorFor = (name?: string): string => {
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
};

/** Local initials avatar. No external requests, so no user data leaves the browser. */
export const InitialsAvatar: React.FC<{ name?: string; className?: string }> = ({ name, className = "" }) => (
  <div
    aria-label={name}
    className={`w-full h-full flex items-center justify-center text-white text-[10px] font-bold select-none ${className}`}
    style={{ backgroundColor: colorFor(name) }}
  >
    {getInitials(name)}
  </div>
);

/** Inline SVG placeholder (data URI) used when a document image is missing or fails to load. */
export const placeholderImage = (label: string, w = 400, h = 300): string =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" fill="#6b7280" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  );
