import { Role } from '@prisma/client';

export type AccessTokenPayload = {
  userInfo: {
    id: string;
    email: string;
    role: Role;
  };
};

export type RefreshTokenPayload = {
  id: string;
};
