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
    <main>
      <h1>Events &amp; MICE — Inquiries</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>New inquiry</h2>
      <form action="/api/events/inquiries" method="POST" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "600px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="contactName" placeholder="Contact name" required />
        <input type="email" name="contactEmail" placeholder="Contact email" required />
        <input type="date" name="eventDate" required />
        <input type="number" name="expectedGuests" placeholder="Expected guests" min="1" required />
        <button type="submit">Log inquiry</button>
      </form>

      <h2>Inquiries</h2>
      {inquiries.map((inq) => (
        <div key={inq.id} style={{ border: "1px solid #ccc", padding: "0.75rem", marginBottom: "0.75rem" }}>
          <strong>{inq.contactName}</strong> ({inq.contactEmail}) — {new Date(inq.eventDate).toLocaleDateString()},{" "}
          {inq.expectedGuests} guests — <strong>{inq.status}</strong>

          {inq.roomBlock && (
            <p>Room block: {inq.roomBlock.roomsBlocked} rooms, {new Date(inq.roomBlock.startDate).toLocaleDateString()} - {new Date(inq.roomBlock.endDate).toLocaleDateString()}</p>
          )}
          {inq.quote && (
            <p>Quote: {Number(inq.quote.amount).toLocaleString()} (deposit {Number(inq.quote.depositAmount).toLocaleString()}, {inq.quote.depositPaid ? "paid" : "unpaid"})</p>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
            {inq.status === "INQUIRY" && !inq.roomBlock && (
              <form action={`/api/events/inquiries/${inq.id}/room-block`} method="POST" style={{ display: "flex", gap: "0.25rem" }}>
                <input type="date" name="startDate" required />
                <input type="date" name="endDate" required />
                <input type="number" name="roomsBlocked" placeholder="Rooms" min="1" required style={{ width: "80px" }} />
                <button type="submit">Hold room block</button>
              </form>
            )}

            {inq.status === "INQUIRY" && !inq.quote && (
              <form action={`/api/events/inquiries/${inq.id}/quote`} method="POST" style={{ display: "flex", gap: "0.25rem" }}>
                <input type="number" name="amount" placeholder="Quote amount" min="1" required style={{ width: "120px" }} />
                <input type="number" name="depositAmount" placeholder="Deposit" min="1" required style={{ width: "100px" }} />
                <button type="submit">Record quote</button>
              </form>
            )}

            {inq.status === "QUOTED" && (
              <form action={`/api/events/inquiries/${inq.id}/deposit`} method="POST">
                <button type="submit">Record deposit paid</button>
              </form>
            )}

            {(inq.status === "INQUIRY" || inq.status === "QUOTED") && (
              <form action={`/api/events/inquiries/${inq.id}/cancel`} method="POST">
                <button type="submit">Cancel</button>
              </form>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}
