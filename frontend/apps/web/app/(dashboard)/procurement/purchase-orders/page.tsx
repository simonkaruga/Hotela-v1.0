import { authHeaders } from "../../../../lib/auth";
import { Card } from "../../../../components/Card";
import { Badge } from "../../../../components/Badge";
import { ErrorBanner } from "../../../../components/ErrorBanner";

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
    return (
      <>
        <h1>Procurement</h1>
        <p className="mt-4 text-sm text-slate-500">Sign in to view procurement.</p>
      </>
    );
  }

  return (
    <>
      <h1>Procurement</h1>
      <ErrorBanner message={error} />

      <h2>Suppliers</h2>
      <Card className="mt-3">
        <table>
          <tbody>
            {(suppliers as Supplier[]).map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td className="text-slate-500">{s.contact ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <form action="/api/procurement/suppliers" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>Supplier name<input name="name" required /></label>
        <label>Contact<input name="contact" /></label>
        <button type="submit" className="secondary">Add supplier</button>
      </form>

      <h2>Inventory</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Item</th><th>Unit</th><th className="text-right">On hand</th><th className="text-right">Reorder level</th></tr></thead>
          <tbody>
            {(inventoryItems as InventoryItem[]).map((i) => {
              const low = Number(i.quantityOnHand) <= Number(i.reorderLevel);
              return (
                <tr key={i.id}>
                  <td className="font-medium">{i.name}</td>
                  <td className="text-slate-500">{i.unit}</td>
                  <td className={`text-right ${low ? "font-medium text-red-600" : ""}`}>{i.quantityOnHand}</td>
                  <td className="text-right text-slate-500">{i.reorderLevel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <form action="/api/procurement/inventory-items" method="POST" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>Item name<input name="name" required /></label>
        <label>Unit<input name="unit" placeholder="kg, box..." required /></label>
        <label>Reorder level<input type="number" name="reorderLevel" min="0" /></label>
        <button type="submit" className="secondary">Add item</button>
      </form>

      <h2>New purchase order</h2>
      <form action="/api/procurement/purchase-orders" method="POST" className="mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label>
          Supplier
          <select name="supplierId" required className="block w-full">
            {(suppliers as Supplier[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>
          Item
          <select name="inventoryItemId" required className="block w-full">
            {(inventoryItems as InventoryItem[]).map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
          </select>
        </label>
        <label>Quantity <input type="number" name="quantity" min="0.01" step="0.01" required className="block w-full" /></label>
        <label>Unit cost <input type="number" name="unitCost" min="0.01" step="0.01" required className="block w-full" /></label>
        <button type="submit" className="mt-1 w-fit">Create PO</button>
      </form>

      <h2>Purchase orders</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Supplier</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(purchaseOrders as PurchaseOrder[]).map((po) => (
              <tr key={po.id}>
                <td className="font-medium">{po.supplier.name}</td>
                <td className="text-slate-600">{po.items.map((it) => `${it.quantity} ${it.inventoryItem.name} @ ${it.unitCost}`).join(", ")}</td>
                <td><Badge status={po.status} /></td>
                <td>
                  <div className="flex gap-2">
                    {po.status === "DRAFT" && (
                      <form action={`/api/procurement/purchase-orders/${po.id}/mark-ordered`} method="POST">
                        <button type="submit" className="secondary">Mark ordered</button>
                      </form>
                    )}
                    {po.status === "ORDERED" && (
                      <form action={`/api/procurement/purchase-orders/${po.id}/receive`} method="POST">
                        <button type="submit">Receive</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2>Supplier invoices</h2>
      <Card className="mt-3">
        <table>
          <thead><tr><th>Supplier</th><th className="text-right">Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(supplierInvoices as SupplierInvoice[]).map((inv) => (
              <tr key={inv.id}>
                <td className="font-medium">{inv.supplier.name}</td>
                <td className="text-right">{Number(inv.amount).toLocaleString()}</td>
                <td className="text-slate-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td><Badge status={inv.status} /></td>
                <td>
                  {inv.status === "UNPAID" && (
                    <form action={`/api/procurement/supplier-invoices/${inv.id}/pay`} method="POST">
                      <button type="submit" className="secondary">Pay</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
