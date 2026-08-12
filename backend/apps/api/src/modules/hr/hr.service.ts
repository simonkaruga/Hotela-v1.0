import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateShiftDto } from './dto/create-shift.dto';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  createEmployee(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: { ...dto, hireDate: new Date(dto.hireDate) } });
  }

  findEmployees(propertyId?: string) {
    return this.prisma.employee.findMany({
      where: { propertyId, active: true },
      orderBy: [{ department: 'asc' }, { lastName: 'asc' }],
    });
  }

  async createShift(dto: CreateShiftDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee ${dto.employeeId} not found`);
    }
    return this.prisma.shift.create({
      data: { ...dto, date: new Date(dto.date) },
      include: { employee: true },
    });
  }

  findShifts(date?: string) {
    return this.prisma.shift.findMany({
      where: date ? { date: { gte: new Date(`${date}T00:00:00.000Z`), lte: new Date(`${date}T23:59:59.999Z`) } } : {},
      include: { employee: true },
      orderBy: { startTime: 'asc' },
    });
  }
}
