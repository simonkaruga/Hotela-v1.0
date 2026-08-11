import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateGuestDto } from './create-guest.dto';

export class UpdateGuestDto extends PartialType(OmitType(CreateGuestDto, ['propertyId'] as const)) {}
