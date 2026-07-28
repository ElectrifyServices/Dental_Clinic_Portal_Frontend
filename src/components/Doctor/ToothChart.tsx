import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

type ConditionId = string;

interface Condition {
  id: ConditionId;
  label: string;
  fill: string;
  stroke: string;
  textColor: string;
}

interface ToothSVGProps {
  num: string;
  conditionIds: ConditionId[] | undefined;
  activeMode: ConditionId;
}

interface ToothCellProps {
  num: string;
  conditionIds: ConditionId[] | undefined;
  isLower: boolean;
  activeMode: ConditionId;
  onClick: () => void;
}

type ToothState = Record<string, ConditionId[]>;

const CONDITIONS: Condition[] = [
  {
    id: "normal",
    label: "Healthy",
    fill: "#ffffff",
    stroke: "#888780",
    textColor: "#444441",
  },
  {
    id: "caries",
    label: "Caries",
    fill: "#EF9F27",
    stroke: "#854F0B",
    textColor: "#633806",
  },
  {
    id: "missing",
    label: "Missing",
    fill: "#F1EFE8",
    stroke: "#B4B2A9",
    textColor: "#888780",
  },
  {
    id: "restored",
    label: "Restored",
    fill: "#85B7EB",
    stroke: "#185FA5",
    textColor: "#0C447C",
  },
  {
    id: "endo",
    label: "Endo / RCT",
    fill: "#ED93B1",
    stroke: "#993556",
    textColor: "#72243E",
  },
  {
    id: "crown",
    label: "Crown",
    fill: "#97C459",
    stroke: "#3B6D11",
    textColor: "#27500A",
  },
  {
    id: "extract",
    label: "For Extraction",
    fill: "#F09595",
    stroke: "#A32D2D",
    textColor: "#791F1F",
  },
  {
    id: "other",
    label: "Other",
    fill: "#E2E8F0",
    stroke: "#64748B",
    textColor: "#334155",
  },
];

const UPPER_TEETH: number[] = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
const LOWER_TEETH: number[] = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

const UPPER_PRIMARY: number[] = [
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
];
const LOWER_PRIMARY: number[] = [
  85, 84, 83, 82, 81, 71, 72, 73, 74, 75,
];

function getToothType(
  num: number,
): "molar" | "premolar" | "canine" | "incisor" {
  const q = Math.floor(num / 10);
  const d = num % 10;
  
  // Deciduous quadrants (5, 6, 7, 8) have no premolars
  const isPrimary = q >= 5 && q <= 8;
  if (isPrimary) {
    if (d >= 4) return "molar";
    if (d === 3) return "canine";
    return "incisor";
  }

  if (d >= 6) return "molar";
  if (d >= 4) return "premolar";
  if (d === 3) return "canine";
  return "incisor";
}

function getCondition(id: ConditionId | undefined): Condition {
  const found = CONDITIONS.find((c) => c.id === id);
  if (found) return found;
  if (id && id !== "normal") {
    return {
      id: id,
      label: id,
      fill: "#E2E8F0",
      stroke: "#64748B",
      textColor: "#334155",
    };
  }
  return CONDITIONS[0];
}

function ToothSVG({ num, conditionIds, activeMode }: ToothSVGProps) {
  const type = num === "FM" ? "molar" : getToothType(parseInt(num));
  const activeConditionId = conditionIds?.includes(activeMode) ? activeMode : (conditionIds && conditionIds.length > 0 ? conditionIds[conditionIds.length - 1] : "normal");
  const cond = getCondition(activeConditionId);
  const missing = conditionIds?.includes("missing");
  const { fill, stroke } = cond;

  let crownPath = "";
  let rootPath = "";
  let highlightPath = "";

  if (type === "molar") {
    crownPath =
      "M3,4 C3,1 8,0 11,0 C14,0 19,1 19,4 C19,10 18,14 16,16 L6,16 C4,14 3,10 3,4Z";
    rootPath =
      "M6,16 L5,28 C4.5,31 7,32 8,28 L9,18 L11,28 C12,32 15,32 14.5,28 L13,18 L13,16";
    highlightPath = "M7,4 Q11,2 15,4";
  } else if (type === "premolar") {
    crownPath =
      "M4,5 C4,1 8,0 11,0 C14,0 18,1 18,5 C18,11 17,14 15,16 L7,16 C5,14 4,11 4,5Z";
    rootPath =
      "M7,16 L6,28 C5.5,31 8,32 9,28 L11,17 L13,28 C14,32 16.5,31 16,28 L15,16";
    highlightPath = "M7,4 Q11,2 15,4";
  } else if (type === "canine") {
    crownPath =
      "M5,6 C5,1 8,0 11,0 C14,0 17,1 17,6 C17,12 15,15 13,16 L9,16 C7,15 5,12 5,6Z";
    rootPath = "M9,16 L9,30 C9,33 13,33 13,30 L13,16";
    highlightPath = "M7,4 Q11,2 15,4";
  } else {
    crownPath =
      "M5,3 L17,3 C19,3 19,6 19,8 C19,12 17,15 14,16 L8,16 C5,15 3,12 3,8 C3,6 3,3 5,3Z";
    rootPath = "M9,16 L9,29 C9,32 13,32 13,29 L13,16";
    highlightPath = "M7,5 Q11,3 15,5";
  }

  const svgHeight = missing ? 20 : 34;

  return (
    <svg
      width="22"
      height={svgHeight}
      viewBox={`0 0 22 ${svgHeight}`}
      style={{ opacity: missing ? 0.35 : 1, display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!missing && (
        <path
          d={rootPath}
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
      <path
        d={crownPath}
        fill={fill}
        stroke={stroke}
        strokeWidth="1.4"
        strokeDasharray={missing ? "3,2" : undefined}
      />
      {!missing && (
        <path
          d={highlightPath}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

function ToothCell({ num, conditionIds, isLower, activeMode, onClick }: ToothCellProps) {
  const isMarked = conditionIds !== undefined && conditionIds.length > 0 && !conditionIds.includes("normal");
  const activeConditionId = conditionIds?.includes(activeMode) ? activeMode : (conditionIds && conditionIds.length > 0 ? conditionIds[conditionIds.length - 1] : "normal");
  const lastCond = getCondition(activeConditionId);

  return (
    <div
      onClick={onClick}
      title={`Tooth ${num}${isMarked ? ` — ${conditionIds!.map(id => getCondition(id).label).join(", ")}` : ""}`}
      style={{
        display: "flex",
        flexDirection: isLower ? "column-reverse" : "column",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        padding: "1px",
        borderRadius: 4,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(0,0,0,0.04)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <ToothSVG num={num} conditionIds={conditionIds} activeMode={activeMode} />
      <span
        style={{
          fontSize: 9,
          fontWeight: isMarked ? 600 : 500,
          color: isMarked ? lastCond.textColor : "#888780",
          lineHeight: 1,
          margin: "2px 0",
          textAlign: "center",
          display: "block",
        }}
      >
        {num}
      </span>
    </div>
  );
}

export function ToothChart({
  onChartChange,
  initialState,
  defaultChartType = "adult",
}: {
  onChartChange?: (state: ToothState) => void;
  initialState?: ToothState;
  defaultChartType?: "adult" | "pediatric" | "full_mouth";
} = {}) {
  const [toothState, setToothState] = useState<ToothState>(initialState || {});
  const [activeMode, setActiveMode] = useState<ConditionId>("caries");
  const [customCondition, setCustomCondition] = useState("");
  const [chartType, setChartType] = useState<"adult" | "pediatric" | "full_mouth">(defaultChartType as any);

  useEffect(() => {
    if (initialState && Object.keys(initialState).length === 0) {
      setToothState({});
    }
  }, [initialState]);

  useEffect(() => {
    onChartChange?.(toothState);
  }, [toothState, onChartChange]);

  useEffect(() => {
    if (defaultChartType) {
      setChartType(defaultChartType);
    }
  }, [defaultChartType]);

  const clickTooth = (num: string): void => {
    const modeToApply = activeMode === "other" && customCondition.trim() !== "" ? customCondition.trim() : activeMode;
    setToothState((prev) => {
      const next: ToothState = { ...prev };
      if (modeToApply === "normal") {
        delete next[num];
      } else {
        const current = next[num] || [];
        if (current.includes(modeToApply)) {
          next[num] = current.filter((id) => id !== modeToApply);
          if (next[num].length === 0) {
            delete next[num];
          }
        } else {
          next[num] = [...current, modeToApply];
        }
      }
      return next;
    });
  };

  const removeFinding = (num: string, cid: ConditionId): void => {
    setToothState((prev) => {
      const next: ToothState = { ...prev };
      if (next[num]) {
        next[num] = next[num].filter((id) => id !== cid);
        if (next[num].length === 0) {
          delete next[num];
        }
      }
      return next;
    });
  };

  const upperTeeth = chartType === "pediatric" ? UPPER_PRIMARY : UPPER_TEETH;
  const lowerTeeth = chartType === "pediatric" ? LOWER_PRIMARY : LOWER_TEETH;

  const findings: [string, ConditionId[]][] = (
    Object.entries(toothState) as [string, ConditionId[]][]
  )
    .filter(([, v]) => v && v.length > 0 && !v.includes("normal"))
    .sort((a, b) => {
      if (a[0] === "FM") return -1;
      if (b[0] === "FM") return 1;
      return parseInt(a[0]) - parseInt(b[0]);
    });

  const hasAdultFindings = findings.some(([num]) => {
    if (num === "FM") return false;
    const n = parseInt(num);
    return UPPER_TEETH.includes(n) || LOWER_TEETH.includes(n);
  });

  const hasPediatricFindings = findings.some(([num]) => {
    if (num === "FM") return false;
    const n = parseInt(num);
    return UPPER_PRIMARY.includes(n) || LOWER_PRIMARY.includes(n);
  });

  const hasFullMouthFindings = findings.some(([num]) => num === "FM");

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "1rem",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 500,
          color: "#888780",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        Dental Chart — FDI / ISO Two-Digit System
      </div>

      {/* Chart Type Selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: "bold", color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em" }}>Chart Type:</span>
        <div style={{ display: "inline-flex", background: "#f1efef", padding: 3, borderRadius: 8 }}>
          <Button
            type="button"
            onClick={() => setChartType("adult")}
            variant={chartType === "adult" ? "default" : "ghost"}
            size="sm"
          >
            Adult (Permanent)
          </Button>
          <Button
            type="button"
            onClick={() => setChartType("pediatric")}
            variant={chartType === "pediatric" ? "default" : "ghost"}
            size="sm"
          >
            Pediatric (Primary)
          </Button>
          <Button
            type="button"
            onClick={() => setChartType("full_mouth")}
            variant={chartType === "full_mouth" ? "default" : "ghost"}
            size="sm"
          >
            Full Mouth
          </Button>
        </div>
      </div>

      {/* Mode selector */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {CONDITIONS.map((c) => {
          const isActive = activeMode === c.id;
          return (
            <Button
              key={c.id}
              type="button"
              onClick={() => setActiveMode(c.id)}
              style={{
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 999,
                border: `0.5px solid ${isActive ? c.stroke : "#ccc"}`,
                background: isActive ? c.fill : "transparent",
                color: isActive ? c.textColor : "#666",
                cursor: "pointer",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {c.label}
            </Button>
          );
        })}
      </div>

      {activeMode === "other" && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Enter custom condition..."
            value={customCondition}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
              setCustomCondition(val);
            }}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #ccc",
              width: "250px",
              outline: "none",
            }}
          />
        </div>
      )}

      {chartType === "full_mouth" && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", flexDirection: "column", alignItems: "center", padding: "1rem 0" }}>
          <div style={{ marginBottom: "1rem", fontSize: 13, color: "#666", textAlign: "center" }}>
            Select a condition above and apply it to the entire mouth. You can also select missing teeth below.
          </div>
          <Button
            type="button"
            onClick={() => {
              setToothState((prev) => {
                const next = { ...prev };
                const modeToApply = activeMode === "other" && customCondition.trim() !== "" ? customCondition.trim() : activeMode;
                if (!next["FM"]) {
                  next["FM"] = [modeToApply];
                } else if (!next["FM"].includes(modeToApply)) {
                  next["FM"] = [...next["FM"], modeToApply];
                }
                return next;
              });
            }}
            variant="outline"
            className="px-8 py-4 border-primary/60 hover:bg-primary/10 text-primary font-bold text-lg rounded-2xl shadow-sm"
          >
            Apply "{CONDITIONS.find(c => c.id === activeMode)?.label || activeMode}" to Full Mouth
          </Button>
        </div>
      )}

      {/* Chart */}
      <div
        className="scrollbar-thin"
        style={{
          background: "#fff",
          border: "0.5px solid #e0e0e0",
          borderRadius: 12,
          padding: "1rem",
          overflowX: "auto",
        }}
      >
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                fontWeight: 500,
                color: "#bbb",
                padding: "0 4px",
                marginBottom: 2,
              }}
            >
              <span>{chartType !== "pediatric" ? "Q1 — upper right" : "Q5 — upper right"}</span>
              <span>{chartType !== "pediatric" ? "Q2 — upper left" : "Q6 — upper left"}</span>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#aaa",
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              Maxilla (upper)
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 2, minWidth: chartType === "adult" ? 540 : 360 }}>
              {upperTeeth.map((num) => (
                <ToothCell
                  key={num}
                  num={num.toString()}
                  conditionIds={toothState[num.toString()]}
                  isLower={false}
                  activeMode={activeMode}
                  onClick={() => clickTooth(num.toString())}
                />
              ))}
            </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "8px 0",
            opacity: 0.2,
          }}
        >
          <div style={{ flex: 1, minWidth: chartType === "adult" ? 200 : 120, height: 0.5, background: "#444" }} />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#444",
            }}
          />
          <div style={{ flex: 1, minWidth: chartType === "adult" ? 200 : 120, height: 0.5, background: "#444" }} />
        </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 2, minWidth: chartType === "adult" ? 540 : 360 }}>
              {lowerTeeth.map((num) => (
                <ToothCell
                  key={num}
                  num={num.toString()}
                  conditionIds={toothState[num.toString()]}
                  isLower={true}
                  activeMode={activeMode}
                  onClick={() => clickTooth(num.toString())}
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#aaa",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Mandible (lower)
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                fontWeight: 500,
                color: "#bbb",
                padding: "0 4px",
                marginTop: 2,
              }}
            >
              <span>{chartType !== "pediatric" ? "Q4 — lower right" : "Q8 — lower right"}</span>
              <span>{chartType !== "pediatric" ? "Q3 — lower left" : "Q7 — lower left"}</span>
            </div>
          </>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: "1rem",
          justifyContent: "center",
        }}
      >
        {CONDITIONS.filter((c) => c.id !== "normal").map((c) => {
          const count = Object.values(toothState).flatMap(v => v || []).filter(
            (v) => v === c.id,
          ).length;
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "#666",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c.fill,
                  border: `1px solid ${c.stroke}`,
                  flexShrink: 0,
                }}
              />
              {c.label}
              {count > 0 ? ` (${count})` : ""}
            </div>
          );
        })}
      </div>

      {/* Findings panel */}
      {findings.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "#f8f8f8",
            borderRadius: 8,
            border: "0.5px solid #e0e0e0",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Findings
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {findings.map(([num, cids]) => {
              return cids.map((cid) => {
                const c = getCondition(cid);
                return (
                  <span
                    key={`${num}-${cid}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: c.fill,
                      color: c.textColor,
                      border: `1px solid ${c.stroke}`,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {num === "FM" || String(num) === "-1" ? "Full Mouth" : `#${num}`} — {c.label}
                    <span
                      onClick={() => removeFinding(num, cid)}
                      style={{
                        cursor: "pointer",
                        opacity: 0.6,
                        fontSize: 13,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </span>
                  </span>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
}
