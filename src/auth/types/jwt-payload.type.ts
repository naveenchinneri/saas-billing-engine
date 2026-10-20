import { UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  organizationId: string;
  role: UserRole;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};