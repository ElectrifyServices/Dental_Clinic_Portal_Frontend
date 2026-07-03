import React, { useState } from 'react';
import {
  Modal,
  Button,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';
import { CorporateEmployee, PlanDependent } from '../../../types';
import { addDependent, updateDependent, notifyDependentChange } from '../../../hooks/corporate/dependentStorage';
import { useModal } from '../../../contexts/ModalContext';

interface Props {
  showForm: boolean;
  setShowForm: (val: boolean) => void;
  employee: CorporateEmployee | null;
  editDep?: PlanDependent | null;
  onSave: () => void;
}
import { useCreateEmployeeMutation } from '../../../hooks/corporate/useCreateEmployeeMutation';
import { useUpdateEmployeeMutation } from '../../../hooks/corporate/useUpdateEmployeeMutation';
import { useEmployeeQuery } from '../../../hooks/corporate/useEmployeeQuery';

export function EmployeeDependentFormModal({ showForm, setShowForm, employee, editDep, onSave }: Props) {
  const { showToast } = useModal();
  const createMemberMutation = useCreateEmployeeMutation();
  const updateMemberMutation = useUpdateEmployeeMutation();

  const { data: dependentDetails } = useEmployeeQuery(editDep?.id, {
    enabled: showForm && !!editDep?.id,
  });

  const [formData, setFormData] = useState<Partial<PlanDependent>>({
    gender: 'male',
    isActive: true,
  });

  const toTitleCase = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  React.useEffect(() => {
    if (dependentDetails) {
      const depData = dependentDetails.data || dependentDetails;
      const rawDob = depData.date_of_birth || depData.dateOfBirth || editDep?.date_of_birth || editDep?.dateOfBirth || '';
      setFormData({
        ...editDep,
        ...depData,
        name: depData.name || editDep?.name,
        phone: depData.phone || editDep?.phone,
        email: depData.email || editDep?.email,
        gender: depData.gender?.toLowerCase() || editDep?.gender || 'male',
        dateOfBirth: rawDob ? rawDob.split('T')[0] : '',
        relationship: toTitleCase(depData.relationship_type || depData.relationship || editDep?.relationship_type || editDep?.relationship),
        isActive: depData.status === 'ACTIVE' || (depData.status === undefined && editDep?.isActive !== false)
      });
    } else if (editDep) {
      const rawDob = editDep.date_of_birth || editDep.dateOfBirth || '';
      setFormData({
        ...editDep,
        relationship: toTitleCase(editDep.relationship_type || editDep.relationship),
        dateOfBirth: rawDob ? rawDob.split('T')[0] : ''
      });
    } else {
      setFormData({ gender: 'male', isActive: true });
    }
  }, [editDep, dependentDetails, showForm]);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relationship) {
      showToast("Please fill in required fields", "error");
      return;
    }

    try {
      const payload = {
        plan_id: employee.corporatePlanId,
        name: employee.name,
        phone: employee.phone || '',
        status: employee.isActive ? 'ACTIVE' : 'INACTIVE',
        family_members: [
          {
            ...(editDep ? { id: editDep.id } : {}),
            name: formData.name,
            relationship_type: formData.relationship.toUpperCase(),
            phone: formData.phone || undefined,
          }
        ]
      };

      await updateMemberMutation.mutateAsync({
        id: employee.id,
        ...payload
      });
      
      showToast(editDep ? "Family member updated successfully" : "Family member added successfully", "success");
      onSave();
      setShowForm(false);
      setFormData({ gender: 'male', isActive: true });
    } catch (err: any) {
      console.error("API Error:", err?.response?.data || err);
      const data = err?.response?.data;
      const msg = data?.message || data?.error || data?.statusDesc || (typeof data === 'string' ? data : err.message) || "Failed to save family member";
      showToast(msg, "error");
    }
  };

  return (
    <Modal
      title={editDep ? `Edit Family Member for ${employee.name}` : `Add Family Member for ${employee.name}`}
      subtitle="Add a family member to this membership"
      onClose={() => setShowForm(false)}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Full Name *</Label>
            <Input
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jane Doe"
              className="rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Relationship *</Label>
            <Select
              required
              value={formData.relationship || ''}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger className="rounded-xl text-sm">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone Number</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) {
                  setFormData({ ...formData, phone: val });
                }
              }}
              placeholder="10-digit number"
              className="rounded-xl text-sm"
              maxLength={10}
            />
          </div>

          {/* <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Email Address</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane@example.com"
              className="rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Date of Birth</Label>
            <Input
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="rounded-xl text-sm"
            />
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Gender</Label>
            <Select
              value={formData.gender || 'male'}
              onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
            >
              <SelectTrigger className="rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Status</Label>
            <Select
              value={formData.isActive ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
            >
              <SelectTrigger className="rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={createMemberMutation.isPending || updateMemberMutation.isPending}>
            {createMemberMutation.isPending || updateMemberMutation.isPending ? "Saving..." : "Save Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
