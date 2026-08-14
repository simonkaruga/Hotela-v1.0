import type { ComponentType } from "react";
import type { ModuleGroup } from "./moduleColors";
import { MODULE_GROUP_STYLES } from "./moduleColors";

export function PageHeader({
  icon: Icon,
  group,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  group: ModuleGroup;
  title: string;
  description?: string;
}) {
  const styles = MODULE_GROUP_STYLES[group];
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1>{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  );
}
