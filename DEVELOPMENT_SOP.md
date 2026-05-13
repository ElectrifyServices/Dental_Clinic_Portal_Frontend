# Frontend Development Standard Operating Procedure (SOP)

This guide outlines the architectural standards and best practices for building scalable, maintainable, and clean components and API integrations within the Dental Clinic Portal.

---

## 1. Reusable Custom Components

### The "Golden Rule" of Styling
**Never use hardcoded Tailwind utility classes for brand or structural properties.** Instead, use the semantic classes and variables defined in `src/index.css`.

#### Bad Practice (Hardcoded)
```tsx
<button className="bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700">
  Submit
</button>
```

#### Good Practice (Semantic)
```tsx
<button className="btn-primary">
  Submit
</button>
```

### Component Structure
Keep your components clean by following this hierarchy:
1.  **Imports**: Group by (React/Library, UI Components, Icons, Hooks/Types).
2.  **Interfaces**: Define clear prop types.
3.  **Hooks**: Extract complex logic into custom hooks.
4.  **Render Helpers**: Small sub-render functions for complex sections.
5.  **Main Component**: Return clean, semantic JSX.

### Example: Scalable Metric Card
```tsx
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
}

export const MetricCard = ({ title, value, trend, icon: Icon }: MetricCardProps) => {
  return (
    <Card className="kpi-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="page-subtitle">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {trend && (
            <div className={cn(
              "badge mt-2",
              trend.isPositive ? "badge-green" : "badge-red"
            )}>
              {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="btn-icon-blue p-3">
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};
```

---

## 2. API Integration Standards

We use a modular approach where every feature (Patient, Appointment, Staff) has its own dedicated API hook.

### File Structure
- `src/hooks/api/usePatientApi.ts`
- `src/hooks/api/useAppointmentApi.ts`
- `src/hooks/api/useStaffApi.ts`

### Step 1: Define the Modular Hook
Inside the hook, define all related queries and mutations using the global `useApiQuery` and `useApiMutation`.

```tsx
// src/hooks/api/usePatientApi.ts
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { Patient } from "@/types";

export const usePatientApi = () => {
  // Query: Get All Patients
  const useGetPatients = (params?: any) => 
    useApiQuery<Patient[]>({
      queryKey: ["patients", params],
      endpoint: "/patients",
      params
    });

  // Query: Get Single Patient
  const useGetPatient = (id: string) =>
    useApiQuery<Patient>({
      queryKey: ["patients", id],
      endpoint: `/patients/${id}`,
      options: { enabled: !!id }
    });

  // Mutation: Create Patient
  const useCreatePatient = () =>
    useApiMutation<Patient, Partial<Patient>>({
      endpoint: "/patients",
      method: "post"
    });

  return {
    useGetPatients,
    useGetPatient,
    useCreatePatient
  };
};
```

### Step 2: Use in Component
Import the modular hook and consume the specific API you need. This keeps the component logic extremely thin.

```tsx
import { usePatientApi } from "@/hooks/api/usePatientApi";
import { Loader2 } from "lucide-react";

export const PatientList = () => {
  const { useGetPatients } = usePatientApi();
  const { data: patients, isLoading, error } = useGetPatients();

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <div className="text-destructive">Failed to load patients</div>;

  return (
    <div className="space-y-4">
      {patients?.map(patient => (
        <div key={patient.id} className="card p-4">
          <h4 className="font-semibold">{patient.name}</h4>
        </div>
      ))}
    </div>
  );
};
```

---

## 3. Best Practices Checklist

### Styling
- [ ] Uses `btn-primary`, `btn-secondary`, `btn-danger` for actions.
- [ ] Uses `card` or `kpi-card` for containers.
- [ ] Uses `badge-green`, `badge-blue`, etc., for status.
- [ ] Uses `form-input` and `form-label` for all inputs.
- [ ] Colors are referenced via CSS variables (e.g., `text-primary`, `bg-muted`).

### Components
- [ ] Component is under 200 lines (if larger, split it).
- [ ] Business logic is extracted into a hook (e.g., `usePatientForm`).
- [ ] Props are strictly typed.
- [ ] Uses Lucide icons consistently.

### API
- [ ] No raw `axios` or `fetch` calls inside components.
- [ ] All endpoints are defined within a modular API hook.
- [ ] `queryKey` is consistent and includes dependencies (like search terms or IDs).
- [ ] `isLoading` and `error` states are handled gracefully.
