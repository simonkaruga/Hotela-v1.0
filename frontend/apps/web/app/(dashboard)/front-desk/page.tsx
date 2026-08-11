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
    return <main>Front desk — no rooms yet.</main>;
  }

  return (
    <main>
      <h1>Front desk — room rack</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {rooms.map((room) => {
          const occupant = room.reservations[0]?.guest;
          return (
            <div key={room.id} style={{ border: "1px solid #ccc", padding: "0.75rem", minWidth: "140px" }}>
              <strong>Room {room.number}</strong>
              <div>{room.roomType.name}</div>
              <div>Status: {room.status}</div>
              <div>{occupant ? `${occupant.firstName} ${occupant.lastName}` : "Vacant"}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
