import React, { useState } from "react";
import {
  Plus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  FilterTabs,
  StatusBadge,
  MetricCard,
} from "@/components/ui";

interface InventoryItem {
  id: string;
  name: string;
  category: "instruments" | "materials" | "consumables" | "medicines";
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  cost: number;
  expiryDate?: string;
}

interface InventoryListProps {
  inventory: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onRestock: (item: InventoryItem) => void;
}

const CAT_META: Record<
  string,
  { label: string; variant: "blue" | "green" | "amber" | "violet" | "gray" }
> = {
  instruments: { label: "Instruments", variant: "blue" },
  materials: { label: "Materials", variant: "green" },
  consumables: { label: "Consumables", variant: "amber" },
  medicines: { label: "Medicines", variant: "violet" },
};

const CATEGORIES = [
  { key: "all", label: "All Items" },
  { key: "instruments", label: "Instruments" },
  { key: "materials", label: "Materials" },
  { key: "consumables", label: "Consumables" },
  { key: "medicines", label: "Medicines" },
];

export function InventoryList({
  inventory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onRestock,
}: InventoryListProps) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const filtered = inventory.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.name.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q)) &&
      (cat === "all" || item.category === cat)
    );
  });

  const lowCount = inventory.filter((i) => i.currentStock <= i.minStock).length;

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 110;
    const windowHeight = window.innerHeight;

    let top = rect.bottom + 4;
    if (rect.bottom + menuHeight > windowHeight) {
      top = rect.top - menuHeight;
      if (top < 0) top = 10;
    }

    setMenuPos({ top, left: rect.right - 160 });
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const columns = [
    {
      key: "item",
      header: "Item",
      render: (item: InventoryItem) => {
        const isLow = item.currentStock <= item.minStock;
        return (
          <div>
            <div className="font-bold text-foreground flex items-center gap-2">
              {item.name}
              {isLow && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              )}
            </div>
            {item.expiryDate && (
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase tracking-wider">
                Exp: {item.expiryDate}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      render: (item: InventoryItem) => {
        const meta = CAT_META[item.category] || {
          label: item.category,
          variant: "gray",
        };
        return (
          <StatusBadge
            variant={meta.variant}
            className="text-[10px] uppercase font-bold"
          >
            {meta.label}
          </StatusBadge>
        );
      },
    },
    {
      key: "stock",
      header: "Stock Level",
      render: (item: InventoryItem) => {
        const isLow = item.currentStock <= item.minStock;
        const max = item.maxStock || item.minStock * 3;
        const pct = Math.min(100, Math.round((item.currentStock / max) * 100));
        return (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span
                className={isLow ? "text-destructive" : "text-muted-foreground"}
              >
                {item.currentStock} {item.unit}
              </span>
              <span className="text-muted-foreground/60">
                Min: {item.minStock}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-amber-500" : "bg-destructive/100"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "cost",
      header: "Unit Cost",
      render: (item: InventoryItem) => (
        <span className="font-bold text-foreground">
          ₹{item.cost.toLocaleString()}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (item: InventoryItem) => (
        <span className="text-muted-foreground font-medium">
          {item.supplier}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center" as const,
      render: (item: InventoryItem) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={() => onRestock(item)}
            title="Restock"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={(e) => openMenu(e, item.id)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {openMenuId === item.id &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div
                    className="fixed z-[9999] bg-card rounded-2xl border border-border shadow-2xl w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          onEditItem(item.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-xl flex items-center gap-2.5 text-primary font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit Item
                      </button>
                      <button
                        onClick={() => {
                          onDeleteItem(item.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 text-destructive font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </>,
                document.body,
              )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        subtitle={`${inventory.length} total stock items recorded`}
        action={
          <Button onClick={onAddItem} className="gap-2">
            <Plus className="w-4 h-4" /> Add New Item
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Items"
          value={inventory.length}
          icon={<Package className="w-5 h-5" />}
          variant="indigo"
        />
        <MetricCard
          label="Low Stock Alert"
          value={lowCount}
          variant={lowCount > 0 ? "rose" : "emerald"}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          label="Total Categories"
          value={Object.keys(CAT_META).length}
          variant="primary"
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {lowCount > 0 && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl px-5 py-4 text-sm font-bold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            {lowCount} critical item{lowCount > 1 ? "s are" : " is"} below
            minimum stock level. Immediate restocking required.
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by item name or supplier…"
          className="flex-1"
        />
        <FilterTabs tabs={CATEGORIES} active={cat} onChange={setCat} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(item) => item.id}
        emptyIcon={<Package className="w-12 h-12 text-muted-foreground/40" />}
        emptyTitle="No inventory items found"
        emptySubtitle="Add your first medical supply to track stock levels."
      />
    </div>
  );
}
