import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitModule } from './modules/livekit/livekit.module';
import { AgentModule } from './modules/agent/agent.module';
import config from './config';

const IMPORTS = [
  ConfigModule.forRoot({
    envFilePath: ['.env'],
    isGlobal: true,
    load: [config],
  }),
  LivekitModule,
  AgentModule,
];

const CONTROLLERS = [];
const PROVIDERS = [];

@Module({
  imports: [...IMPORTS],
  controllers: [...CONTROLLERS],
  providers: [...PROVIDERS],
})
export class AppModule {}
