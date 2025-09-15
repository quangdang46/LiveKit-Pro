import { Module } from '@nestjs/common';
import { RecordingModule } from './modules/recording/recording.module';
import { ConfigModule } from '@nestjs/config';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [config],
    }),
    RecordingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
