import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminUserService } from '../services/admin.user.service';
import { AdminGuard } from '../../global/guards/admin.guard';
import { Role } from 'generated/prisma/enums';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  findAll(@Query('role') role?: Role) {
    return this.adminUserService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUserService.findOne(id);
  }

  @Patch(':id/verify')
  verifyPatient(@Param('id') id: string) {
    return this.adminUserService.verifyPatient(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminUserService.remove(id);
  }
}
