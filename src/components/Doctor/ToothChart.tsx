import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

type ConditionId =
  | "normal"
  | "caries"
  | "missing"
  | "restored"
  | "endo"
  | "crown"
  | "extract";

interface Condition {
  id: ConditionId;
  label: string;
  fill: string;
  stroke: string;
  textColor: string;
}

interface ToothSVGProps {
  num: number;
  conditionIds: ConditionId[] | undefined;
}

interface ToothCellProps {
  num: number;
  conditionIds: ConditionId[] | undefined;
  isLower: boolean;
  onClick: () => void;
}

type ToothState = Record<number, ConditionId[]>;

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
  return CONDITIONS.find((c) => c.id === id) ?? CONDITIONS[0];
}

function ToothSVG({ num, conditionIds }: ToothSVGProps) {
  const type = getToothType(num);
  const activeConditionId = conditionIds && conditionIds.length > 0 ? conditionIds[conditionIds.length - 1] : "normal";
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

function ToothCell({ num, conditionIds, isLower, onClick }: ToothCellProps) {
  const isMarked = conditionIds !== undefined && conditionIds.length > 0 && !conditionIds.includes("normal");
  const lastCond = conditionIds && conditionIds.length > 0 ? getCondition(conditionIds[conditionIds.length - 1]) : getCondition("normal");

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
      <ToothSVG num={num} conditionIds={conditionIds} />
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
  defaultChartType?: "adult" | "pediatric";
} = {}) {
  const [toothState, setToothState] = useState<ToothState>(initialState || {});
  const [activeMode, setActiveMode] = useState<ConditionId>("caries");
  const [chartType, setChartType] = useState<"adult" | "pediatric">(defaultChartType);

  useEffect(() => {
    onChartChange?.(toothState);
  }, [toothState, onChartChange]);

  useEffect(() => {
    if (defaultChartType) {
      setChartType(defaultChartType);
    }
  }, [defaultChartType]);

  const clickTooth = (num: number): void => {
    setToothState((prev) => {
      const next: ToothState = { ...prev };
      if (activeMode === "normal") {
        delete next[num];
      } else {
        const current = next[num] || [];
        if (current.includes(activeMode)) {
          next[num] = current.filter((id) => id !== activeMode);
          if (next[num].length === 0) {
            delete next[num];
          }
        } else {
          next[num] = [...current, activeMode];
        }
      }
      return next;
    });
  };

  const removeFinding = (num: number, cid: ConditionId): void => {
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

  const upperTeeth = chartType === "adult" ? UPPER_TEETH : UPPER_PRIMARY;
  const lowerTeeth = chartType === "adult" ? LOWER_TEETH : LOWER_PRIMARY;

  const findings: [string, ConditionId[]][] = (
    Object.entries(toothState) as [string, ConditionId[]][]
  )
    .filter(([, v]) => v && v.length > 0 && !v.includes("normal"))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

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
          <button
            type="button"
            onClick={() => setChartType("adult")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: chartType === "adult" ? "bold" : "500",
              borderRadius: 6,
              border: "none",
              background: chartType === "adult" ? "#fff" : "transparent",
              color: chartType === "adult" ? "#2563eb" : "#666",
              boxShadow: chartType === "adult" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Adult (Permanent)
          </button>
          <button
            type="button"
            onClick={() => setChartType("pediatric")}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: chartType === "pediatric" ? "bold" : "500",
              borderRadius: 6,
              border: "none",
              background: chartType === "pediatric" ? "#fff" : "transparent",
              color: chartType === "pediatric" ? "#2563eb" : "#666",
              boxShadow: chartType === "pediatric" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Pediatric (Primary)
          </button>
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
          <span>{chartType === "adult" ? "Q1 — upper right" : "Q5 — upper right"}</span>
          <span>{chartType === "adult" ? "Q2 — upper left" : "Q6 — upper left"}</span>
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
              num={num}
              conditionIds={toothState[num]}
              isLower={false}
              onClick={() => clickTooth(num)}
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
              num={num}
              conditionIds={toothState[num]}
              isLower={true}
              onClick={() => clickTooth(num)}
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
          <span>{chartType === "adult" ? "Q4 — lower right" : "Q8 — lower right"}</span>
          <span>{chartType === "adult" ? "Q3 — lower left" : "Q7 — lower left"}</span>
        </div>
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
                    #{num} — {c.label}
                    <span
                      onClick={() => removeFinding(parseInt(num), cid)}
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
