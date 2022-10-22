import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// 1. Create a custom decorator to set `roles` metadata for the route.
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
