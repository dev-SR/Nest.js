import { Role } from '@prisma/client';

export type GetUserInfo = {
  userInfo: {
    id: string;
    email: string;
    role: Role;
  };
  iat: number;
  exp: number;
};
