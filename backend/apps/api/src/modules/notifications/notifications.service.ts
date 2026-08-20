import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  notify(propertyId: string, type: string, message: string) {
    return this.prisma.notification.create({ data: { propertyId, type, message } });
  }

  findForProperty(propertyId: string, unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: { propertyId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(propertyId: string) {
    await this.prisma.notification.updateMany({ where: { propertyId, read: false }, data: { read: true } });
    return { propertyId };
  }
}
