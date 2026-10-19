import type { ApiAny } from "../../types/api";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  MinusCircle,
  Filter,
  X,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  Button,
  PageHeader,
  DataTable,
  SearchInput,
  StatusBadge,
  MetricCard,
  Pagination,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useInventoryListQuery } from "../../hooks/inventory/useInventoryListQuery";
import { useInventorySummaryQuery } from "../../hooks/inventory/useInventorySummaryQuery";
import { useInventoryCategoriesQuery } from "../../hooks/inventory/useInventoryCategoriesQuery";

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
  onConsume: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
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

// Removed hardcoded CATEGORIES

export function InventoryList({
  inventory: _inventory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onRestock,
  onConsume,
  onAdjust,
  onViewHistory,
}: InventoryListProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: summary } = useInventorySummaryQuery({ refetchOnMount: "always" });
  const { data: listData, isLoading: _isLoading } = useInventoryListQuery({
    search: debouncedSearch,
    category: cat,
    low_stock: lowStockFilter,
    page: currentPage,
    limit: itemsPerPage,
  }, { refetchOnMount: "always" });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, cat, lowStockFilter, itemsPerPage]);

  const { data: categoriesData } = useInventoryCategoriesQuery();

  let dynamicCategories: ApiAny[] = [];
  if (Array.isArray(categoriesData)) dynamicCategories = categoriesData;
  else if (Array.isArray(categoriesData?.data)) dynamicCategories = categoriesData.data;
  else if (Array.isArray(categoriesData?.items)) dynamicCategories = categoriesData.items;
  else if (Array.isArray(categoriesData?.responseObject)) dynamicCategories = categoriesData.responseObject;
  else if (Array.isArray(categoriesData?.responseObject?.data)) dynamicCategories = categoriesData.responseObject.data;
  else if (categoriesData?.responseObject && Array.isArray(categoriesData?.responseObject?.categories)) dynamicCategories = categoriesData.responseObject.categories;

  const filterTabs = [
    { key: "all", label: "All Items" },
    ...dynamicCategories.map((c: ApiAny) => ({
      key: c?.id || c?._id || c?.categoryId || c?.category_id || c?.name,
      label: c.name || "Unknown"
    }))
  ];

  let rawList: ApiAny[] = [];
  if (Array.isArray(listData)) rawList = listData;
  else if (Array.isArray(listData?.items)) rawList = listData.items;
  else if (Array.isArray(listData?.data)) rawList = listData.data;
  else if (Array.isArray(listData?.data?.items)) rawList = listData.data.items;
  else if (Array.isArray(listData?.responseObject)) rawList = listData.responseObject;
  
  const filtered = rawList.map((item: ApiAny) => ({
    id: item.id,
    name: item.name,
    category: item.category?.name || item.category_name || item.category,
    currentStock: item.current_stock ?? item.currentStock ?? 0,
    minStock: item.min_stock ?? item.minStock ?? 0,
    maxStock: item.max_stock ?? item.maxStock ?? 100,
    unit: item.unit ?? "pieces",
    supplier: item.supplier ?? "Unknown",
    lastRestocked: item.last_restocked ?? item.lastRestocked ?? "",
    cost: item.unit_cost ?? item.cost ?? 0,
    expiryDate: item.expiry_date && !isNaN(Date.parse(item.expiry_date)) ? new Date(item.expiry_date).toISOString().split('T')[0] : item.expiryDate ?? "",
    batchNumber: item.batch_number ?? item.batchNumber ?? "",
  }));

  const summaryData = (summary as ApiAny)?.data || summary;
  const lowCount = summaryData?.low_stock_count || 0;
  const listWrapper: ApiAny = listData || {};
  const pagination = listWrapper?.pagination || listWrapper?.data?.pagination || listWrapper?.responseObject?.pagination || listWrapper?.responseObject?.data?.pagination || {};
  const totalItems = Number(
    pagination.total_items ?? pagination.totalItems ?? listWrapper?.total ?? listWrapper?.data?.total ?? listWrapper?.responseObject?.total ?? listWrapper?.responseObject?.data?.total ?? rawList.length,
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

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
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
        const category = String(item.category || "").trim();
        const categoryKey = category.toLowerCase().replace(/[_-]+/g, " ");
        const meta = categoryKey.includes("consum")
          ? { label: category || "Consumables", variant: "amber" as const }
          : categoryKey.includes("medic")
            ? { label: category || "Medicines", variant: "violet" as const }
            : categoryKey.includes("instrument")
              ? { label: category || "Instruments", variant: "blue" as const }
              : categoryKey.includes("material")
                ? { label: category || "Materials", variant: "green" as const }
                : categoryKey.includes("hygiene") || categoryKey.includes("ppe")
                  ? { label: category, variant: "blue" as const }
                  : CAT_META[categoryKey] || { label: category || "Uncategorized", variant: "gray" as const };
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
                className={`h-1.5 rounded-full transition-all duration-500 ${pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-amber-500" : "bg-destructive"}`}
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
                    className="fixed inset-0 z-9998"
                    onClick={() => setOpenMenuId(null)}
                  />
                  <div
                    className="fixed z-9999 bg-card rounded-2xl border border-border shadow-2xl w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    <div className="p-1.5 space-y-0.5">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onRestock(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-xl flex items-center gap-2.5 text-primary font-medium transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Restock
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onConsume(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-amber-500/10 rounded-xl flex items-center gap-2.5 text-amber-600 font-medium transition-colors"
                      >
                        <MinusCircle className="w-4 h-4" /> Consume
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onAdjust(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-blue-500/10 rounded-xl flex items-center gap-2.5 text-blue-600 font-medium transition-colors"
                      >
                        <SlidersHorizontal className="w-4 h-4" /> Adjust
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onViewHistory(item);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-xl flex items-center gap-2.5 text-foreground font-medium transition-colors"
                      >
                        <Clock className="w-4 h-4" /> History
                      </Button>
                      <div className="h-px bg-border my-1 mx-2" />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onEditItem(item.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-primary/10 rounded-xl flex items-center gap-2.5 text-primary font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit Item
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onDeleteItem(item.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full justify-start! text-left px-3 py-2 text-sm hover:bg-destructive/10 rounded-xl flex items-center gap-2.5 text-destructive font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
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
  const paginatedData = filtered;

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Inventory Management"
          subtitle={`${totalItems} total items in stock`}
          action={
            <Button onClick={onAddItem} className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          }
        />
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Items"
          value={summaryData?.total_items || 0}
          icon={<Package className="w-5 h-5" />}
          variant="indigo"
        />
        <div onClick={() => setLowStockFilter(!lowStockFilter)} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <MetricCard
            label={lowStockFilter ? "Showing Low Stock" : "Low Stock Alert"}
            value={lowCount}
            variant={lowCount > 0 ? "rose" : "emerald"}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        </div>
        <MetricCard
          label="Total Categories"
          value={summaryData?.total_categories || 0}
          variant="primary"
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {lowCount > 0 && (
        <div className="shrink-0 flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl px-5 py-4 text-sm font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            {lowCount} critical item{lowCount > 1 ? "s are" : " is"} below
            minimum stock level. Immediate restocking required.
          </span>
        </div>
      )}

      <div className="shrink-0 space-y-3">
        <div className="flex items-center gap-2 bg-card p-4 rounded-2xl border border-border shadow-sm">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by item name or supplier…"
            className="flex-1 min-w-0"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className={cn("gap-2 shrink-0", cat !== "all" && "border-primary bg-primary/10 text-primary hover:bg-primary/15")}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {cat !== "all" && (
              <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">1</span>
            )}
          </Button>

          {cat !== "all" && (
            <Button variant="ghost" onClick={() => setCat("all")} className="gap-1 text-muted-foreground shrink-0">
              <X className="w-3 h-3" /> <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Category</Label>
                <Select value={cat} onValueChange={setCat}>
                  <SelectTrigger className="h-10 w-full text-xs font-semibold rounded-xl border border-border bg-muted/50">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {filterTabs.map((t) => (
                      <SelectItem key={t.key} value={t.key} className="text-xs font-medium">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
        <DataTable
          className="flex-1 min-h-0"
          columns={columns}
          data={paginatedData}
          rowKey={(item) => item.id}
          emptyIcon={<Package className="w-12 h-12 text-muted-foreground/40" />}
          emptyTitle="No inventory items found"
          emptySubtitle="Add your first medical supply to track stock levels."
          footer={
            totalItems > 0 ? (
              <div className="py-4 px-6 border-t border-border/50 bg-muted/20">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  perPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={setItemsPerPage}
                />
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
