import { Module } from '@nestjs/common';
import { RolesGuard } from './auth/roles.guard';

@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
