# 📋 Dental Clinic Portal Frontend - Changes & Development Log

> **Note:** Yeh file frontend me kiye gaye sabhi custom changes ka complete record hai. Pull lene ya merge karne se pehle is file ko refer karein taaki conflicts aasani se resolve ho sakein.

---

## 📅 Summary of Changes (Session Log)

### 1. 🏢 Corporate Billing & Employee Enrollment Features

#### A. Corporate Employees Billing API Hook (`src/hooks/corporate/useCorporateEmployeesBillingQuery.ts`) [NEW FILE]
- **Purpose:** Fetches enrolled employees for a selected corporate membership plan using the `/membershipPlan/:id/enrolled-employees` endpoint.
- **Key Logic:**
  - Integrated with `@tanstack/react-query`.
  - Automatically fetches when `planId` is selected in corporate billing mode.
  - Enabled flag prevents unnecessary API calls when switching forms.

---

#### B. Corporate Pending Employees Carousel Component (`src/components/Billing/InvoiceForm/CorporatePendingEmployees.tsx`) [NEW FILE]
- **Purpose:** Renders enrolled corporate members directly above the billable items table in `InvoiceForm`.
- **Key Features & UI Layout:**
  - **Horizontal Scroll Carousel:** Smooth horizontal scroll for large lists of employees.
  - **Left / Right Scroll Buttons:** Integrated with common UI `<Button>` component with `type="button"` and positioned without hover jump bugs.
  - **Live Search Bar:** Search employees instantly by name or phone.
  - **"Select Multiple" Button:** Opens bulk selection modal.
  - **"Add All" Button:** One-click billing for all employees in the plan.
  - **Card States:** Visual distinction for selected vs unselected employee cards (with `billing_amount`, phone, email).
  - **Responsive Design:** Uses `flex-wrap` and overflow protection to seamlessly fit inside modals without squishing.

---

#### C. Corporate Bulk Select Modal (`src/components/Billing/InvoiceForm/CorporateBulkSelectModal.tsx`) [NEW FILE]
- **Purpose:** Allows granular selection (e.g., selecting 37 out of 100 employees) for corporate billing.
- **Key Features:**
  - Select All checkbox for filtered results.
  - Search filter within the modal.
  - Real-time selection counter (`X / Total Selected`).
  - Table showing Employee Name, Phone, and Annual Fee.
  - Syncs selection back to `InvoiceForm` on "Apply Selection".

---

#### D. Invoice Form Integration (`src/components/Billing/InvoiceForm.tsx`) [MODIFIED]
- **Key Changes:**
  - **Corporate Billing Mode Switch:** Shows `CorporatePendingEmployees` instead of individual `PendingItems` when corporate toggle is ON.
  - **Bulk Items Handling:** Added support for adding and removing multiple corporate employee items in batch without duplicates.
  - **Scrollable Billable Items Area:** Added `max-h-[400px] overflow-y-auto` to the billable items table so large corporate invoices stay clean and usable.
  - **Prevented Unwanted Suggestions:** Disabled individual membership suggestions when corporate toggle is switched.

---

### 2. 👥 Corporate Management & Employee Import (`src/components/CorporatePlans/*`, `src/components/Patients/*`)
- **Files Modified:**
  - `src/components/CorporatePlans/Employee/EmployeeImportTab.tsx`
  - `src/components/CorporatePlans/Employee/importUtils.ts`
  - `src/components/CorporatePlans/Plan/CorporatePlanFormModal.tsx`
  - `src/components/CorporatePlans/Plan/constants.tsx`
  - `src/components/Patients/CorporateManagement.tsx`
  - `src/hooks/corporate/useBulkImportEmployeeMutation.ts`
- **Purpose:** Employee bulk excel import validation, corporate plan creation forms, and corporate patient listing tabs.

---

## 🗂️ Modified & Created Files Quick Reference Table (Frontend)

| File Path | Status | Description |
| :--- | :--- | :--- |
| `src/hooks/corporate/useCorporateEmployeesBillingQuery.ts` | **NEW** | Hook to fetch corporate employees for billing |
| `src/components/Billing/InvoiceForm/CorporatePendingEmployees.tsx` | **NEW** | Horizontal scroll card component for billable employees |
| `src/components/Billing/InvoiceForm/CorporateBulkSelectModal.tsx` | **NEW** | Granular multi-selection modal (checkboxes) |
| `src/components/Billing/InvoiceForm.tsx` | **MODIFIED** | Corporate toggle logic, bulk add handlers, scroll container |
| `src/components/CorporatePlans/Employee/importUtils.ts` | **MODIFIED** | Excel import helper utilities |
| `src/components/CorporatePlans/Plan/CorporatePlanFormModal.tsx` | **MODIFIED** | Corporate plan form & contact fields |
| `src/components/Patients/CorporateManagement.tsx` | **MODIFIED** | Corporate management screens |
| `src/hooks/corporate/useBulkImportEmployeeMutation.ts` | **MODIFIED** | Bulk import mutation hook |
