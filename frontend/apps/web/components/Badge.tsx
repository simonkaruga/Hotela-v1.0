const STATUS_STYLES: Record<string, string> = {
  // positive / settled / confirmed
  CHECKED_IN: "bg-emerald-50 text-emerald-700",
  SETTLED: "bg-emerald-50 text-emerald-700",
  PAID: "bg-emerald-50 text-emerald-700",
  RECEIVED: "bg-emerald-50 text-emerald-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  POSTED: "bg-emerald-50 text-emerald-700",
  CLEAN: "bg-emerald-50 text-emerald-700",
  // in progress / open / neutral
  OPEN: "bg-amber-50 text-amber-700",
  DRAFT: "bg-amber-50 text-amber-700",
  BOOKED: "bg-amber-50 text-amber-700",
  ORDERED: "bg-amber-50 text-amber-700",
  UNPAID: "bg-amber-50 text-amber-700",
  QUOTED: "bg-amber-50 text-amber-700",
  INQUIRY: "bg-amber-50 text-amber-700",
  DIRTY: "bg-amber-50 text-amber-700",
  CHECKED_OUT: "bg-slate-100 text-slate-600",
  // negative / cancelled
  CANCELLED: "bg-red-50 text-red-700",
  VOID: "bg-red-50 text-red-700",
  NO_SHOW: "bg-red-50 text-red-700",
  OUT_OF_ORDER: "bg-red-50 text-red-700",
};

export function Badge({ status }: { status: string }) {
  const classes = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
