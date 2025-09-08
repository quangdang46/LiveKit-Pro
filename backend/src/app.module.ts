import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitModule } from './modules/livekit/livekit.module';
import { AgentModule } from './modules/agent/agent.module';
import config from './config';
import { ScriptModule } from './modules/script/script.module';
import { GatewayModule } from './modules/gateway/gateway.module';

const IMPORTS = [
  ConfigModule.forRoot({
    envFilePath: ['.env'],
    isGlobal: true,
    load: [config],
  }),
  LivekitModule,
  AgentModule,
  ScriptModule,
  GatewayModule,
];

const CONTROLLERS = [];
const PROVIDERS = [];

@Module({
  imports: [...IMPORTS],
  controllers: [...CONTROLLERS],
  providers: [...PROVIDERS],
})
export class AppModule {}
