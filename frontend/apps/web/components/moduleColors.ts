export type ModuleGroup = "front-office" | "guest-spend" | "back-office" | "admin";

export const MODULE_GROUP_STYLES: Record<ModuleGroup, { icon: string; ring: string }> = {
  "front-office": { icon: "bg-indigo-50 text-indigo-600", ring: "group-hover:ring-indigo-200" },
  "guest-spend": { icon: "bg-amber-50 text-amber-600", ring: "group-hover:ring-amber-200" },
  "back-office": { icon: "bg-emerald-50 text-emerald-600", ring: "group-hover:ring-emerald-200" },
  admin: { icon: "bg-rose-50 text-rose-600", ring: "group-hover:ring-rose-200" },
};
