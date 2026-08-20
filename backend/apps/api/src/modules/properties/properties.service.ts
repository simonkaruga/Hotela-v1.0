import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePropertyDto) {
    return this.prisma.property.create({ data: dto });
  }

  findAll() {
    return this.prisma.property.findMany({ orderBy: { name: 'asc' } });
  }
}
