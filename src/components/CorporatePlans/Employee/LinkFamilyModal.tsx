import React, { useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { Modal, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui';
import { CorporateEmployee } from '../../../types';
import { formatPhoneWithCountryCode } from '../../../utils/phoneUtils';
import { useLinkFamilyMembersMutation } from '../../../hooks/corporate/useLinkFamilyMembersMutation';
import { useModal } from '../../../contexts/ModalContext';

interface LinkFamilyModalProps {
  members: CorporateEmployee[];
  onClose: () => void;
  onLinked: () => void;
}

const RELATIONSHIP_OPTIONS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

export function LinkFamilyModal({ members, onClose, onLinked }: LinkFamilyModalProps) {
  const { showToast } = useModal();
  const linkMutation = useLinkFamilyMembersMutation();

  const [headId, setHeadId] = useState<string>(members[0]?.id || '');
  const [relationships, setRelationships] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    members.forEach((m, i) => { if (i > 0) initial[m.id] = 'Spouse'; });
    return initial;
  });

  const head = members.find(m => m.id === headId);
  const others = members.filter(m => m.id !== headId);

  // Already-linked members (have their own dependents, or are themselves a
  // dependent) cannot be safely re-linked here — surfaced as a blocking
  // warning rather than silently failing on the backend's own check.
  const blockedOthers = others.filter(m => (m as CorporateEmployee & { dependents?: unknown[] }).dependents?.length);

  // A cancelled membership cannot be linked (or made the head) of a family —
  // mirrors the backend's own check, surfaced here before the user submits.
  const cancelledMembers = members.filter(m => m.status === 'CANCELLED');

  const handleHeadChange = (val: string) => {
    setHeadId(val);
    setRelationships(prev => {
      const next = { ...prev };
      delete next[val];
      members.forEach(m => {
        if (m.id !== val && !next[m.id]) next[m.id] = 'Spouse';
      });
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!headId || others.length === 0) return;
    try {
      await linkMutation.mutateAsync({
        parent_member_id: headId,
        members: others.map(m => ({
          id: m.id,
          relationship_type: (relationships[m.id] || 'Spouse').toUpperCase(),
        })),
      });
      showToast(`${others.length} member${others.length > 1 ? 's' : ''} linked as family successfully`, 'success');
      onLinked();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Failed to link members as family';
      showToast(msg, 'error');
    }
  };

  return (
    <Modal title="Link as Family" subtitle={`Connect ${members.length} selected members under one family`} onClose={onClose} size="md">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-foreground">Choose the head / primary member</p>
          <Select value={headId} onValueChange={handleHeadChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select head member" />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name.trim()} — {formatPhoneWithCountryCode(m.phone, (m as CorporateEmployee & { country_code?: string }).country_code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {cancelledMembers.length > 0 && (
          <div className="card border-red-200 bg-red-50 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 space-y-1">
              <p className="font-semibold">
                {cancelledMembers.length} member{cancelledMembers.length > 1 ? 's have' : ' has'} a cancelled membership and cannot be linked as family:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {cancelledMembers.map(m => (
                  <li key={m.id}>{m.name.trim()}</li>
                ))}
              </ul>
              <p>Remove {cancelledMembers.length > 1 ? 'them' : 'it'} from this selection to continue.</p>
            </div>
          </div>
        )}

        {blockedOthers.length > 0 && (
          <div className="card border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold">
                {blockedOthers.length} member{blockedOthers.length > 1 ? 's already have' : ' already has'} their own family members and cannot be linked as a dependent:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {blockedOthers.map(m => (
                  <li key={m.id}>{m.name.trim()}</li>
                ))}
              </ul>
              <p>Unlink their family first, or remove {blockedOthers.length > 1 ? 'them' : 'it'} from this selection.</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Relationship to {head?.name?.trim() || 'head member'}</p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {others.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2 p-2.5 border border-border rounded-xl">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.name.trim()}</p>
                  <p className="text-xs text-muted-foreground">{formatPhoneWithCountryCode(m.phone, (m as CorporateEmployee & { country_code?: string }).country_code)}</p>
                </div>
                <Select
                  value={relationships[m.id] || 'Spouse'}
                  onValueChange={val => setRelationships(prev => ({ ...prev, [m.id]: val }))}
                >
                  <SelectTrigger className="w-32 h-9 text-xs flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button onClick={onClose} variant="outline" disabled={linkMutation.isPending}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="default"
            className="gap-2"
            disabled={linkMutation.isPending || others.length === 0 || blockedOthers.length > 0 || cancelledMembers.length > 0}
          >
            <Users className="w-4 h-4" />
            {linkMutation.isPending ? 'Linking…' : `Link ${others.length} Member${others.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
