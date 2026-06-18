import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { parseApiResponse } from "../../services/parseApiResponse";

export interface MembershipStats {
  totalPlans: number;
  totalMembers: number;
  companyPlans: number;
  individualPlans: number;
}

export function useMembershipStatsQuery() {
  return useQuery({
    queryKey: ["membershipStats"],
    queryFn: async (): Promise<MembershipStats> => {
      const [totalRes, membersRes, companyRes, individualRes] = await Promise.all([
        apiClient.get("/membershipPlan/total"),
        apiClient.get("/membershipPlan/members"),
        apiClient.get("/membershipPlan/company-plans"),
        apiClient.get("/membershipPlan/individual-plans"),
      ]);

      const getCount = (res: any, key: string) => {
        try {
          const parsed = parseApiResponse(res.data);
          // parseApiResponse might return responseObject, so parsed.data is the inner object
          // For example: { "company_plans": 1 }
          const data: any = parsed?.data || parsed || {};
          
          if (typeof data === "number") return data;
          if (typeof data === "string") return parseInt(data, 10) || 0;
          
          if (data[key] !== undefined && data[key] !== null) {
            return Number(data[key]) || 0;
          }
          
          if (typeof data.count === "number") return data.count;
          if (typeof data.total === "number") return data.total;
          
          // Check nested data if parseApiResponse didn't unwrap it
          if (data.data && data.data[key] !== undefined) {
             return Number(data.data[key]) || 0;
          }
          
          return 0;
        } catch (err) {
          return 0;
        }
      };

      return {
        totalPlans: getCount(totalRes, "total_plans"),
        totalMembers: getCount(membersRes, "total_members"),
        companyPlans: getCount(companyRes, "company_plans"),
        individualPlans: getCount(individualRes, "individual_plans"),
      };
    },
  });
}
