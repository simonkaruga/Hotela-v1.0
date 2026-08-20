import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class HousekeepingService {
  constructor(private readonly prisma: PrismaService) {}

  createTask(dto: CreateTaskDto) {
    return this.prisma.housekeepingTask.create({
      data: dto,
      include: { room: true, assignedTo: true },
    });
  }

  findTasks(propertyId?: string) {
    return this.prisma.housekeepingTask.findMany({
      where: propertyId ? { room: { propertyId } } : {},
      include: { room: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async start(id: string) {
    const task = await this.getTask(id);
    if (task.status !== 'PENDING') {
      throw new BadRequestException(`Cannot start a task with status ${task.status}`);
    }
    return this.prisma.housekeepingTask.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: { room: true, assignedTo: true },
    });
  }

  async complete(id: string) {
    const task = await this.getTask(id);
    if (task.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`Cannot complete a task with status ${task.status}`);
    }
    return this.prisma.housekeepingTask.update({
      where: { id },
      data: { status: 'DONE' },
      include: { room: true, assignedTo: true },
    });
  }

  async inspect(id: string) {
    const task = await this.getTask(id);
    if (task.status !== 'DONE') {
      throw new BadRequestException(`Cannot inspect a task with status ${task.status}`);
    }
    const [updated] = await this.prisma.$transaction([
      this.prisma.housekeepingTask.update({
        where: { id },
        data: { status: 'INSPECTED', completedAt: new Date() },
        include: { room: true, assignedTo: true },
      }),
      this.prisma.room.update({ where: { id: task.roomId }, data: { status: 'CLEAN' } }),
    ]);
    return updated;
  }

  private async getTask(id: string) {
    const task = await this.prisma.housekeepingTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Housekeeping task ${id} not found`);
    }
    return task;
  }
}
