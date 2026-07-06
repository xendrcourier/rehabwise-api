import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { resolvePostgresConnectionString } from '../utils/database-url';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const adapter = new PrismaPg({
      connectionString: resolvePostgresConnectionString(
        process.env.DATABASE_URL,
      ),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('::> Prisma connected to postgres db');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('::> Prisma disconnected from postgres db');
  }
}
