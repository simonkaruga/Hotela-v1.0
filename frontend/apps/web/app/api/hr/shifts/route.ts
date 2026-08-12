import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/hr/shifts", "/hr/employees", (form) => ({
    employeeId: String(form.get("employeeId") ?? ""),
    date: String(form.get("date") ?? ""),
    startTime: String(form.get("startTime") ?? ""),
    endTime: String(form.get("endTime") ?? ""),
    department: String(form.get("department") ?? ""),
  }));
}
