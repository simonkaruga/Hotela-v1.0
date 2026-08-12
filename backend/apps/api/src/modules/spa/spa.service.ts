import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class SpaService {
  constructor(private readonly prisma: PrismaService) {}

  createTreatment(dto: CreateTreatmentDto) {
    return this.prisma.treatment.create({ data: dto });
  }

  findTreatments(propertyId?: string) {
    return this.prisma.treatment.findMany({
      where: { propertyId, available: true },
      orderBy: { name: 'asc' },
    });
  }

  async createAppointment(dto: CreateAppointmentDto) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id: dto.reservationId } });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${dto.reservationId} not found`);
    }
    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException('Spa appointments can only be charged to a checked-in reservation');
    }

    const treatment = await this.prisma.treatment.findUnique({ where: { id: dto.treatmentId } });
    if (!treatment) {
      throw new NotFoundException(`Treatment ${dto.treatmentId} not found`);
    }

    return this.prisma.appointment.create({
      data: {
        reservationId: dto.reservationId,
        treatmentId: dto.treatmentId,
        therapistName: dto.therapistName,
        scheduledAt: new Date(dto.scheduledAt),
      },
      include: { treatment: true, reservation: { include: { guest: true } } },
    });
  }

  findAppointments(reservationId?: string) {
    return this.prisma.appointment.findMany({
      where: { reservationId },
      include: { treatment: true, reservation: { include: { guest: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async cancel(id: string) {
    const appointment = await this.getBookedAppointment(id);
    return this.prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'CANCELLED' } });
  }

  async postToFolio(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { treatment: true, reservation: { include: { folio: true } } },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    if (appointment.status !== 'BOOKED') {
      throw new BadRequestException(`Cannot post an appointment with status ${appointment.status}`);
    }
    const folio = appointment.reservation.folio;
    if (!folio) {
      throw new BadRequestException('Reservation has no folio to post to');
    }
    if (folio.status !== 'OPEN') {
      throw new BadRequestException(`Cannot post to a folio with status ${folio.status}`);
    }

    await this.prisma.$transaction([
      this.prisma.folioTransaction.create({
        data: {
          folioId: folio.id,
          type: 'SPA_CHARGE',
          amount: appointment.treatment.price,
          description: `Spa: ${appointment.treatment.name} (${appointment.therapistName})`,
        },
      }),
      this.prisma.appointment.update({ where: { id }, data: { status: 'POSTED' } }),
    ]);

    return this.prisma.appointment.findUnique({ where: { id }, include: { treatment: true } });
  }

  private async getBookedAppointment(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }
    if (appointment.status !== 'BOOKED') {
      throw new BadRequestException(`Cannot cancel an appointment with status ${appointment.status}`);
    }
    return appointment;
  }
}
