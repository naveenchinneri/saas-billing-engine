import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('organizations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  // Any authenticated tenant user can read organization details
  @Get('me')
  async getMyOrganization(@CurrentUser('organizationId') orgId: string) {
    return this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });
  }

  // Only OWNER or ADMIN roles are permitted to list team members
  @Get('members')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async getMembers(@CurrentUser() user: JwtPayload) {
    return this.prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}