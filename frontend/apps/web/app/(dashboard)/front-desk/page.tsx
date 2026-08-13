import { Badge } from "../../../components/Badge";

type Room = {
  id: string;
  number: string;
  floor: string | null;
  status: string;
  roomType: { name: string };
  reservations: { guest: { firstName: string; lastName: string } }[];
};

async function getRooms(): Promise<Room[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/rooms`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load rooms: ${res.status}`);
  }
  return res.json();
}

export default async function FrontDeskPage() {
  const rooms = await getRooms();

  if (rooms.length === 0) {
    return (
      <>
        <h1>Front Desk — Room Rack</h1>
        <p className="mt-4 text-sm text-slate-500">No rooms yet.</p>
      </>
    );
  }

  return (
    <>
      <h1>Front Desk — Room Rack</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rooms.map((room) => {
          const occupant = room.reservations[0]?.guest;
          return (
            <div
              key={room.id}
              className={`rounded-lg border p-4 shadow-sm ${occupant ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold text-slate-900">{room.number}</span>
                <Badge status={room.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{room.roomType.name}</p>
              <p className="mt-3 text-sm font-medium text-slate-800">
                {occupant ? `${occupant.firstName} ${occupant.lastName}` : <span className="text-slate-400">Vacant</span>}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
