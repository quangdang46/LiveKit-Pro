/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { ScriptService } from './script.service';
import { ScriptController } from './script.controller';
import * as schema from './schema/script.entity';

const PROVIDERS: Provider[] = [
  {
    provide: 'SCRIPT_TOKEN',
    useFactory: (configService: ConfigService) => {
      const connectionString = configService.get<string>('DATABASE_URL');
      if (!connectionString) {
        throw new Error('DATABASE_URL is not set in environment variables');
      }
      const client = postgres(connectionString, { prepare: false });
      return drizzle(client, { schema });
    },
    inject: [ConfigService],
  },
  ScriptService,
];




@Module({
  imports: [],
  providers: [...PROVIDERS],
  controllers: [ScriptController],
})
export class ScriptModule {}
