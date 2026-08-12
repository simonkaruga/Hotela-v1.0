import { NextRequest } from "next/server";
import { proxyFormPost } from "../../../../lib/proxy";

export async function POST(request: NextRequest) {
  return proxyFormPost(request, "/hr/employees", "/hr/employees", (form) => ({
    propertyId: String(form.get("propertyId") ?? ""),
    firstName: String(form.get("firstName") ?? ""),
    lastName: String(form.get("lastName") ?? ""),
    department: String(form.get("department") ?? ""),
    phone: String(form.get("phone") ?? "") || undefined,
    hireDate: String(form.get("hireDate") ?? ""),
  }));
}
