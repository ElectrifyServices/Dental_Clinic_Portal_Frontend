import React, { useState, useMemo, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button, Input, Loading, ConfirmModal } from '@/components/ui';
import { Search, Plus, Edit2, Trash2, Check, X, ChevronDown } from 'lucide-react';
import { useServiceDescriptionsQuery } from '../../../hooks/billing/useServiceDescriptionsQuery';
import { useCreateServiceDescriptionMutation } from '../../../hooks/billing/useCreateServiceDescriptionMutation';
import { useUpdateServiceDescriptionMutation } from '../../../hooks/billing/useUpdateServiceDescriptionMutation';
import { useDeleteServiceDescriptionMutation } from '../../../hooks/billing/useDeleteServiceDescriptionMutation';

interface ServiceDescriptionSelectProps {
  value: string;
  onChange: (value: string, rate: number, id?: string) => void;
}

export function ServiceDescriptionSelect({ value, onChange }: ServiceDescriptionSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);
  
  const { data: rawData, isLoading } = useServiceDescriptionsQuery({ search: debouncedSearch });
  
  const createMutation = useCreateServiceDescriptionMutation();
  const updateMutation = useUpdateServiceDescriptionMutation();
  const deleteMutation = useDeleteServiceDescriptionMutation();

  const services = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    
    let list: any = [];
    if (rawData.responseObject?.data?.data) {
      list = rawData.responseObject.data.data;
    } else if (rawData.data?.data) {
      list = rawData.data.data;
    } else if (rawData.data) {
      list = rawData.data;
    } else if (rawData.items) {
      list = rawData.items;
    }
    
    return Array.isArray(list) ? list : [];
  }, [rawData]);

  const filteredServices = useMemo(() => {
    if (!search) return services;
    return services.filter((s: any) => 
      (s.name || s.description || s.label || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [services, search]);

  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  const handleSelect = (s: any) => {
    const name = s.name || s.description || s.label || '';
    onChange(name, undefined as any, s.id);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!addName.trim()) return;
    try {
      await createMutation.mutateAsync({ name: addName });
      setAdding(false);
      setAddName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, name: editName });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      setDeleteId(null);
      setDeleteName(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 rounded-lg text-sm bg-card font-normal"
        >
          <span className="truncate">{value || "Select Service"}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="flex flex-col max-h-[300px]">
          <div className="flex items-center border-b px-3 sticky top-0 bg-popover z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10 ml-1"
              onClick={() => {
                setAdding(true);
                setAddName(search);
              }}
              title="Add New Service"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1 p-1">
            {adding && (
              <div className="p-2 border rounded-md mb-2 bg-muted/30 flex flex-col gap-2">
                <Input 
                  placeholder="Service Name" 
                  value={addName} 
                  onChange={e => setAddName(e.target.value)} 
                  className="h-8 text-xs"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending} className="h-8 px-2">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-8 px-2 text-muted-foreground">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="p-4 text-center">
                <Loading type="spinner" className="h-5 w-5 mx-auto" />
              </div>
            ) : filteredServices.length === 0 && !adding ? (
              <p className="p-4 text-sm text-center text-muted-foreground">No services found.</p>
            ) : (
              filteredServices.map((s: any) => {
                const sName = s.name || s.description || s.label || '';
                const isEditing = editingId === s.id;

                if (isEditing) {
                  return (
                    <div key={s.id} className="p-2 border rounded-md my-1 bg-muted/30 flex flex-col gap-2">
                      <Input 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        className="h-8 text-xs"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => handleUpdate(s.id)} disabled={updateMutation.isPending} className="h-8 px-2">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 px-2 text-muted-foreground">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={s.id} 
                    className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer group"
                    onClick={() => handleSelect(s)}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{sName}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(s.id);
                          setEditName(sName);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(s.id);
                          setDeleteName(sName);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>

      {deleteId && deleteName && (
        <ConfirmModal
          title="Delete Service Description"
          message={`Are you sure you want to delete the service "${deleteName}"?`}
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => {
            setDeleteId(null);
            setDeleteName(null);
          }}
        />
      )}
    </Popover>
  );
}
