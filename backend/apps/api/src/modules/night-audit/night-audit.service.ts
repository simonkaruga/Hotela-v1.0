import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RunNightAuditDto } from './dto/run-night-audit.dto';

@Injectable()
export class NightAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async run(dto: RunNightAuditDto) {
    const dayStart = new Date(`${dto.date.slice(0, 10)}T00:00:00.000Z`);

    const overdueConfirmed = await this.prisma.reservation.findMany({
      where: { propertyId: dto.propertyId, status: 'CONFIRMED', checkIn: { lt: dayStart } },
      include: { guest: true },
    });
    const noShows: { reservationId: string; guest: string }[] = [];
    for (const r of overdueConfirmed) {
      await this.prisma.reservation.update({ where: { id: r.id }, data: { status: 'NO_SHOW' } });
      noShows.push({ reservationId: r.id, guest: `${r.guest.firstName} ${r.guest.lastName}` });
    }

    const checkedIn = await this.prisma.reservation.findMany({
      where: { propertyId: dto.propertyId, status: 'CHECKED_IN' },
      include: { guest: true, room: { include: { roomType: true } }, folio: true },
    });

    const description = `Room charge — ${dto.date.slice(0, 10)}`;
    const roomChargesPosted: { reservationId: string; guest: string; room: string; amount: number }[] = [];
    const skipped: { reservationId: string; reason: string }[] = [];
    for (const r of checkedIn) {
      if (!r.room || !r.folio || r.folio.status !== 'OPEN') {
        skipped.push({ reservationId: r.id, reason: !r.room ? 'no room assigned' : 'folio not open' });
        continue;
      }
      const alreadyPosted = await this.prisma.folioTransaction.findFirst({
        where: { folioId: r.folio.id, description },
      });
      if (alreadyPosted) {
        skipped.push({ reservationId: r.id, reason: 'already posted for this date' });
        continue;
      }
      await this.prisma.folioTransaction.create({
        data: {
          folioId: r.folio.id,
          type: 'ROOM_CHARGE',
          amount: r.room.roomType.baseRate,
          description,
        },
      });
      roomChargesPosted.push({
        reservationId: r.id,
        guest: `${r.guest.firstName} ${r.guest.lastName}`,
        room: r.room.number,
        amount: Number(r.room.roomType.baseRate),
      });
    }

    return {
      date: dto.date.slice(0, 10),
      noShows,
      roomChargesPosted,
      skipped,
    };
  }
}
