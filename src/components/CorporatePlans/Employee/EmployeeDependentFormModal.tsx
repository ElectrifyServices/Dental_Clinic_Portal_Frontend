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
          </div>

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
          <Button type="submit" variant="default">
            Save Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
