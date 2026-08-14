import { Badge } from "../../../components/Badge";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyState } from "../../../components/EmptyState";
import { Avatar } from "../../../components/Avatar";
import { FrontDeskIcon } from "../../../components/icons";

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

  return (
    <>
      <PageHeader icon={FrontDeskIcon} group="front-office" title="Front Desk" description="Room rack and live occupancy." />
      {rooms.length === 0 ? (
        <EmptyState icon={FrontDeskIcon} title="No rooms yet" description="Rooms will appear here once added to the property." />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rooms.map((room) => {
            const occupant = room.reservations[0]?.guest;
            return (
              <div
                key={room.id}
                className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${occupant ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-white"}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold text-slate-900">{room.number}</span>
                  <Badge status={room.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{room.roomType.name}</p>
                <div className="mt-3">
                  {occupant ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={`${occupant.firstName} ${occupant.lastName}`} />
                      <span className="text-sm font-medium text-slate-800">{occupant.firstName} {occupant.lastName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Vacant</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
