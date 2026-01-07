import { SetMetadata } from '@nestjs/common';
// Role decorator'ı içine verilen role stringlerini roles adı ile metadata olarak kaydeder.
export const Role = (...roles: string[]) => SetMetadata('roles', roles);
