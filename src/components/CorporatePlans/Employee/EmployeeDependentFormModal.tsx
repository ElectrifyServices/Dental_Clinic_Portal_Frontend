import React, { useState } from 'react';
import { Modal, Button, Label, Input } from '../../ui';
import { CorporateEmployee, PlanDependent } from '../../../types';
import { addDependent, notifyDependentChange } from '../../../hooks/corporate/dependentStorage';
import { useModal } from '../../../contexts/ModalContext';

interface Props {
  showForm: boolean;
  setShowForm: (val: boolean) => void;
  employee: CorporateEmployee | null;
  onSave: () => void;
}

export function EmployeeDependentFormModal({ showForm, setShowForm, employee, onSave }: Props) {
  const { showToast } = useModal();
  const [formData, setFormData] = useState<Partial<PlanDependent>>({
    gender: 'male',
    isActive: true,
  });

  if (!employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.relationship) {
      showToast("Please fill in required fields", "error");
      return;
    }

    try {
      addDependent({
        memberId: employee.id,
        name: formData.name,
        relationship: formData.relationship,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male'|'female'|'other',
        phone: formData.phone,
        email: formData.email,
        isActive: formData.isActive,
        corporatePlanId: employee.corporatePlanId,
        primaryMemberName: employee.name,
      });
      notifyDependentChange();
      showToast("Family member added successfully", "success");
      onSave();
      setShowForm(false);
      setFormData({ gender: 'male', isActive: true });
    } catch (err) {
      showToast("Failed to save dependent", "error");
    }
  };

  return (
    <Modal
      title={`Add Family Member for ${employee.name}`}
      subtitle="Register a dependent under this corporate plan"
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
            <select
              required
              value={formData.relationship || ''}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background font-medium"
            >
              <option value="">Select relationship</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Phone Number</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit number"
              className="rounded-xl text-sm"
            />
          </div>

          <div>
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
            <select
              value={formData.gender || 'male'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background font-medium"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label className="text-[10px] font-semibold text-muted-foreground mb-1 block">Status</Label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background font-medium"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Save Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
