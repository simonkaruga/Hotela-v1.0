import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly reservations: ReservationsRepository) {}

  async create(dto: CreateReservationDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    if (checkOut <= checkIn) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    if (dto.roomId) {
      await this.assertRoomAvailable(dto.roomId, checkIn, checkOut);
    }

    return this.reservations.createWithFolio({
      propertyId: dto.propertyId,
      guestId: dto.guestId,
      roomId: dto.roomId,
      checkIn,
      checkOut,
    });
  }

  findAll(propertyId?: string, status?: ReservationStatus) {
    return this.reservations.findMany({ propertyId, status });
  }

  async findOne(id: string) {
    const reservation = await this.reservations.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }
    return reservation;
  }

  async checkIn(id: string, dto: CheckInDto) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot check in a reservation with status ${reservation.status}`);
    }

    const roomId = dto.roomId ?? reservation.roomId;
    if (!roomId) {
      throw new BadRequestException('A room must be assigned before check-in');
    }
    if (roomId !== reservation.roomId) {
      await this.assertRoomAvailable(roomId, reservation.checkIn, reservation.checkOut, id);
    }

    return this.reservations.updateStatus(id, 'CHECKED_IN', roomId);
  }

  async checkOut(id: string) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException(`Cannot check out a reservation with status ${reservation.status}`);
    }

    if (reservation.roomId) {
      await this.reservations.setRoomStatus(reservation.roomId, 'DIRTY');
    }
    return this.reservations.updateStatus(id, 'CHECKED_OUT');
  }

  async cancel(id: string) {
    const reservation = await this.findOne(id);
    if (reservation.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot cancel a reservation with status ${reservation.status}`);
    }
    return this.reservations.updateStatus(id, 'CANCELLED');
  }

  private async assertRoomAvailable(roomId: string, checkIn: Date, checkOut: Date, excludeReservationId?: string) {
    const overlapping = await this.reservations.findOverlapping(roomId, checkIn, checkOut);
    const conflicts = overlapping.filter((r) => r.id !== excludeReservationId);
    if (conflicts.length > 0) {
      throw new ConflictException('Room is already booked for the requested dates');
    }
  }
}
