import { PlanDependent } from '../../types';
import { demoPlanDependents } from '../../data/demoData';

const STORAGE_KEY = 'plan_dependents';

function readAll(): PlanDependent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlanDependent[];
  } catch {/* ignore */}
  // Seed demo data on first read
  const seeded = [...demoPlanDependents] as PlanDependent[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeAll(dependents: PlanDependent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dependents));
}

export function getDependent(id: string): PlanDependent | undefined {
  return readAll().find(d => d.id === id);
}

export function getDependentsByMember(memberId: string): PlanDependent[] {
  return readAll().filter(d => d.memberId === memberId);
}

export function addDependent(dep: Omit<PlanDependent, 'id'>): PlanDependent {
  const all = readAll();
  const newDep: PlanDependent = { ...dep, id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  writeAll([...all, newDep]);
  return newDep;
}

export function updateDependent(id: string, updates: Partial<Omit<PlanDependent, 'id' | 'memberId'>>): PlanDependent {
  const all = readAll();
  const idx = all.findIndex(d => d.id === id);
  if (idx === -1) throw new Error(`Dependent ${id} not found`);
  const updated = { ...all[idx], ...updates };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function removeDependent(id: string): void {
  const all = readAll().filter(d => d.id !== id);
  writeAll(all);
}

/** Find a dependent by their patient ID (set when dependent registers as a patient). */
export function getDependentByPatientId(patientId: string): PlanDependent | undefined {
  return readAll().find(d => d.patientId === patientId);
}

/** Dispatches a custom event so components re-render after localStorage writes. */
export function notifyDependentChange(): void {
  window.dispatchEvent(new CustomEvent('plan_dependents_changed'));
}
