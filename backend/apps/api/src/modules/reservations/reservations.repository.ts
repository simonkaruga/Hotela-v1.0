import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus, RoomStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

const ACTIVE_STATUSES: ReservationStatus[] = ['CONFIRMED', 'CHECKED_IN'];

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOverlapping(roomId: string, checkIn: Date, checkOut: Date): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        roomId,
        status: { in: ACTIVE_STATUSES },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
  }

  createWithFolio(data: {
    propertyId: string;
    guestId: string;
    roomId?: string;
    checkIn: Date;
    checkOut: Date;
  }) {
    return this.prisma.reservation.create({
      data: {
        ...data,
        folio: { create: {} },
      },
      include: { folio: true, room: true, guest: true },
    });
  }

  findMany(filter: { propertyId?: string; status?: ReservationStatus }) {
    return this.prisma.reservation.findMany({
      where: filter,
      include: { guest: true, room: true, folio: true },
      orderBy: { checkIn: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: { guest: true, room: true, folio: { include: { transactions: true } } },
    });
  }

  updateStatus(id: string, status: ReservationStatus, roomId?: string) {
    return this.prisma.reservation.update({
      where: { id },
      data: { status, ...(roomId ? { roomId } : {}) },
      include: { guest: true, room: true, folio: true },
    });
  }

  setRoomStatus(roomId: string, status: RoomStatus) {
    return this.prisma.room.update({ where: { id: roomId }, data: { status } });
  }
}
