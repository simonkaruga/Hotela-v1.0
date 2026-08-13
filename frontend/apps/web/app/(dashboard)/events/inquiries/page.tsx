import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";

type Inquiry = {
  id: string;
  contactName: string;
  contactEmail: string;
  eventDate: string;
  expectedGuests: number;
  status: string;
  roomBlock: { roomsBlocked: number; startDate: string; endDate: string } | null;
  quote: { amount: string; depositAmount: string; depositPaid: boolean } | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function getInquiries(): Promise<Inquiry[]> {
  const res = await fetch(`${apiUrl}/events/inquiries`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load inquiries: ${res.status}`);
  return res.json();
}

export default async function EventInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [guests, inquiries] = await Promise.all([getGuests(), getInquiries()]);
  const propertyId = guests[0]?.propertyId ?? "";

  return (
    <>
      <h1>Events &amp; MICE — Inquiries</h1>
      <ErrorBanner message={error} />

      <h2>New inquiry</h2>
      <form action="/api/events/inquiries" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>Contact name<input name="contactName" required /></label>
        <label>Contact email<input type="email" name="contactEmail" required /></label>
        <label>Event date<input type="date" name="eventDate" required /></label>
        <label>Expected guests<input type="number" name="expectedGuests" min="1" required /></label>
        <button type="submit">Log inquiry</button>
      </form>

      <h2>Inquiries</h2>
      <div className="mt-3 flex flex-col gap-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900">{inq.contactName}</span>{" "}
                <span className="text-sm text-slate-500">({inq.contactEmail})</span>
              </div>
              <Badge status={inq.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(inq.eventDate).toLocaleDateString()} · {inq.expectedGuests} guests
            </p>

            {inq.roomBlock && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Room block:</span> {inq.roomBlock.roomsBlocked} rooms,{" "}
                {new Date(inq.roomBlock.startDate).toLocaleDateString()} – {new Date(inq.roomBlock.endDate).toLocaleDateString()}
              </p>
            )}
            {inq.quote && (
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Quote:</span> {Number(inq.quote.amount).toLocaleString()}{" "}
                (deposit {Number(inq.quote.depositAmount).toLocaleString()},{" "}
                <span className={inq.quote.depositPaid ? "text-emerald-700" : "text-amber-700"}>
                  {inq.quote.depositPaid ? "paid" : "unpaid"}
                </span>)
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
              {inq.status === "INQUIRY" && !inq.roomBlock && (
                <form action={`/api/events/inquiries/${inq.id}/room-block`} method="POST" className="flex items-end gap-2">
                  <label>Start<input type="date" name="startDate" required /></label>
                  <label>End<input type="date" name="endDate" required /></label>
                  <label>Rooms<input type="number" name="roomsBlocked" min="1" required className="w-20" /></label>
                  <button type="submit" className="secondary">Hold room block</button>
                </form>
              )}

              {inq.status === "INQUIRY" && !inq.quote && (
                <form action={`/api/events/inquiries/${inq.id}/quote`} method="POST" className="flex items-end gap-2">
                  <label>Amount<input type="number" name="amount" min="1" required className="w-28" /></label>
                  <label>Deposit<input type="number" name="depositAmount" min="1" required className="w-24" /></label>
                  <button type="submit" className="secondary">Record quote</button>
                </form>
              )}

              {inq.status === "QUOTED" && (
                <form action={`/api/events/inquiries/${inq.id}/deposit`} method="POST">
                  <button type="submit">Record deposit paid</button>
                </form>
              )}

              {(inq.status === "INQUIRY" || inq.status === "QUOTED") && (
                <form action={`/api/events/inquiries/${inq.id}/cancel`} method="POST">
                  <button type="submit" className="danger">Cancel</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
