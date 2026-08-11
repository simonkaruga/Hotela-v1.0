import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyReport(propertyId: string, date: string) {
    const dayStart = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
    const dayEnd = new Date(`${date.slice(0, 10)}T23:59:59.999Z`);

    const [totalRooms, arrivals, departures, inHouseCount, roomChargeTransactions] = await Promise.all([
      this.prisma.room.count({ where: { propertyId } }),
      this.prisma.reservation.findMany({
        where: { propertyId, checkIn: { gte: dayStart, lte: dayEnd }, status: { not: 'CANCELLED' } },
        include: { guest: true, room: true },
      }),
      this.prisma.reservation.findMany({
        where: { propertyId, checkOut: { gte: dayStart, lte: dayEnd }, status: { not: 'CANCELLED' } },
        include: { guest: true, room: true },
      }),
      this.prisma.reservation.count({ where: { propertyId, status: 'CHECKED_IN' } }),
      this.prisma.folioTransaction.findMany({
        where: {
          type: 'ROOM_CHARGE',
          createdAt: { gte: dayStart, lte: dayEnd },
          folio: { reservation: { propertyId } },
        },
      }),
    ]);

    const roomRevenue = roomChargeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const occupiedRooms = inHouseCount;
    const occupancyPct = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const adr = occupiedRooms > 0 ? roomRevenue / occupiedRooms : 0;
    const revPar = totalRooms > 0 ? roomRevenue / totalRooms : 0;

    return {
      date: date.slice(0, 10),
      totalRooms,
      occupiedRooms,
      occupancyPct: Math.round(occupancyPct * 100) / 100,
      roomRevenue,
      adr: Math.round(adr * 100) / 100,
      revPar: Math.round(revPar * 100) / 100,
      arrivals,
      departures,
      inHouseCount,
    };
  }
}
