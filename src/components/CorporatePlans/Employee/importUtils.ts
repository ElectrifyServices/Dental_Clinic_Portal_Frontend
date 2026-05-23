import * as XLSX from 'xlsx';
import { CorporateEmployee, CorporatePlan } from '../../../types';

export function parseXlsx(file: File, plans: CorporatePlan[]): Promise<{ rows: Partial<CorporateEmployee>[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const errors: string[] = [];
        const rows: Partial<CorporateEmployee>[] = [];

        raw.forEach((r, i) => {
          const row = i + 2;
          const name = String(r['Name'] || r['name'] || '').trim();
          const phone = String(r['Phone'] || r['Mobile'] || r['phone'] || '').trim();
          const email = String(r['Email'] || r['email'] || '').trim();
          const planCode = String(r['PlanCode'] || r['Plan Code'] || r['plan_code'] || '').trim();
          const planCodeUpper = planCode.toUpperCase();
          const companyName = String(r['Company'] || r['CompanyName'] || r['company'] || '').trim();

          if (!name) { errors.push(`Row ${row}: Name is required`); return; }
          if (!phone) { errors.push(`Row ${row}: Phone is required`); return; }

          const plan = plans.find(p => 
            p.id.toUpperCase() === planCodeUpper ||
            p.code.toUpperCase() === planCodeUpper ||
            p.name.toUpperCase() === planCodeUpper
          );

          const isUuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(planCode);

          if (!planCode) {
            errors.push(`Row ${row}: Plan Code is required`);
          } else if (!plan && !isUuid) { 
            errors.push(`Row ${row}: Plan "${planCode}" not found`); 
          }

          const eligibleDate = String(r['EligibleDate'] || r['eligible_date'] || r['Eligible Date'] || '').trim();

          rows.push({
            id: `EMP-${Date.now()}-${i}`,
            employeeId: String(r['EmployeeId'] || r['EmpID'] || r['employee_id'] || '').trim(),
            name, phone, email,
            gender: (['male','female','other'].includes(String(r['Gender'] || '').toLowerCase()) ? String(r['Gender']).toLowerCase() : 'male') as any,
            dateOfBirth: String(r['DOB'] || r['DateOfBirth'] || '').trim(),
            designation: String(r['Designation'] || r['designation'] || '').trim(),
            department: String(r['Department'] || r['department'] || '').trim(),
            companyName: companyName || plan?.companyName || '',
            corporatePlanId: plan?.id || (isUuid ? planCode : ''),
            corporatePlanName: plan?.name || (isUuid ? 'Selected Plan' : ''),
            enrolledAt: new Date().toISOString(),
            eligible_date: eligibleDate || new Date().toISOString().split('T')[0],
            isActive: true,
          });
        });
        resolve({ rows, errors });
      } catch {
        resolve({ rows: [], errors: ['Failed to parse file. Ensure it is a valid Excel or CSV file.'] });
      }
    };
    reader.readAsBinaryString(file);
  });
}

export function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Phone', 'Email', 'Gender', 'EmployeeId', 'Designation', 'Department', 'Company', 'PlanCode', 'DOB', 'EligibleDate'],
    ['Rajesh Kumar', '9876543210', 'rajesh@tcs.com', 'male', 'Electrify001', 'Engineer', 'IT', 'Tata Consultancy Services', 'Electrify-GOLD', '1990-01-15', '2026-05-20'],
    ['Priya Sharma', '8765432109', 'priya@tcs.com', 'female', 'Electrify002', 'Manager', 'HR', 'Tata Consultancy Services', 'Electrify-GOLD', '1988-05-22', '2026-05-20'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employee_import_template.xlsx');
}
