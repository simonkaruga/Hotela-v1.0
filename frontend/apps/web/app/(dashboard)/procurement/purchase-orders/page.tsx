import { authHeaders } from "../../../../lib/auth";

type Supplier = { id: string; name: string; contact: string | null };
type InventoryItem = { id: string; name: string; unit: string; quantityOnHand: string; reorderLevel: string };
type PurchaseOrder = {
  id: string;
  status: string;
  supplier: { name: string };
  items: { quantity: string; unitCost: string; inventoryItem: { name: string } }[];
  supplierInvoice: { id: string; amount: string; status: string } | null;
};
type SupplierInvoice = { id: string; amount: string; status: string; dueDate: string; supplier: { name: string } };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getGuests(): Promise<{ propertyId: string }[]> {
  const res = await fetch(`${apiUrl}/guests`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load guests: ${res.status}`);
  return res.json();
}

async function authedGet<T>(path: string): Promise<T | "forbidden"> {
  const headers = await authHeaders();
  const res = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers });
  if (res.status === 401 || res.status === 403) return "forbidden";
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const guests = await getGuests();
  const propertyId = guests[0]?.propertyId ?? "";

  const [suppliers, inventoryItems, purchaseOrders, supplierInvoices] = await Promise.all([
    authedGet<Supplier[]>(`/procurement/suppliers?propertyId=${propertyId}`),
    authedGet<InventoryItem[]>(`/procurement/inventory-items?propertyId=${propertyId}`),
    authedGet<PurchaseOrder[]>(`/procurement/purchase-orders?propertyId=${propertyId}`),
    authedGet<SupplierInvoice[]>(`/procurement/supplier-invoices?propertyId=${propertyId}`),
  ]);

  if (suppliers === "forbidden") {
    return <main><h1>Procurement</h1><p>Sign in to view procurement.</p></main>;
  }

  return (
    <main>
      <h1>Procurement</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Suppliers</h2>
      <ul>{(suppliers as Supplier[]).map((s) => <li key={s.id}>{s.name} {s.contact ? `(${s.contact})` : ""}</li>)}</ul>
      <form action="/api/procurement/suppliers" method="POST" style={{ display: "flex", gap: "0.5rem", maxWidth: "400px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="name" placeholder="Supplier name" required />
        <input name="contact" placeholder="Contact" />
        <button type="submit">Add supplier</button>
      </form>

      <h2>Inventory</h2>
      <table>
        <thead><tr><th>Item</th><th>Unit</th><th>On hand</th><th>Reorder level</th></tr></thead>
        <tbody>
          {(inventoryItems as InventoryItem[]).map((i) => (
            <tr key={i.id}><td>{i.name}</td><td>{i.unit}</td><td>{i.quantityOnHand}</td><td>{i.reorderLevel}</td></tr>
          ))}
        </tbody>
      </table>
      <form action="/api/procurement/inventory-items" method="POST" style={{ display: "flex", gap: "0.5rem", maxWidth: "500px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input name="name" placeholder="Item name" required />
        <input name="unit" placeholder="Unit (kg, box...)" required />
        <input type="number" name="reorderLevel" placeholder="Reorder level" min="0" />
        <button type="submit">Add item</button>
      </form>

      <h2>New purchase order</h2>
      <form action="/api/procurement/purchase-orders" method="POST" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px" }}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>
          Supplier
          <select name="supplierId" required style={{ display: "block", width: "100%" }}>
            {(suppliers as Supplier[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          Item
          <select name="inventoryItemId" required style={{ display: "block", width: "100%" }}>
            {(inventoryItems as InventoryItem[]).map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
          </select>
        </label>
        <label>Quantity <input type="number" name="quantity" min="0.01" step="0.01" required style={{ display: "block", width: "100%" }} /></label>
        <label>Unit cost <input type="number" name="unitCost" min="0.01" step="0.01" required style={{ display: "block", width: "100%" }} /></label>
        <button type="submit">Create PO</button>
      </form>

      <h2>Purchase orders</h2>
      <table>
        <thead><tr><th>Supplier</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(purchaseOrders as PurchaseOrder[]).map((po) => (
            <tr key={po.id}>
              <td>{po.supplier.name}</td>
              <td>{po.items.map((it) => `${it.quantity} ${it.inventoryItem.name} @ ${it.unitCost}`).join(", ")}</td>
              <td>{po.status}</td>
              <td style={{ display: "flex", gap: "0.5rem" }}>
                {po.status === "DRAFT" && (
                  <form action={`/api/procurement/purchase-orders/${po.id}/mark-ordered`} method="POST">
                    <button type="submit">Mark ordered</button>
                  </form>
                )}
                {po.status === "ORDERED" && (
                  <form action={`/api/procurement/purchase-orders/${po.id}/receive`} method="POST">
                    <button type="submit">Receive</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Supplier invoices</h2>
      <table>
        <thead><tr><th>Supplier</th><th>Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(supplierInvoices as SupplierInvoice[]).map((inv) => (
            <tr key={inv.id}>
              <td>{inv.supplier.name}</td>
              <td>{Number(inv.amount).toLocaleString()}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td>{inv.status}</td>
              <td>
                {inv.status === "UNPAID" && (
                  <form action={`/api/procurement/supplier-invoices/${inv.id}/pay`} method="POST">
                    <button type="submit">Pay</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
