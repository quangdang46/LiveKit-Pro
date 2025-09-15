import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Upload } from 'livekit-server-sdk';

@Injectable()
export class S3ConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): Partial<S3Upload> {
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secret = this.configService.get<string>('S3_SECRET_KEY');
    const region = this.configService.get<string>('S3_REGION');
    const bucket = this.configService.get<string>('S3_BUCKET');

    if (!accessKey || !secret || !region || !bucket) {
      throw new Error(
        'Missing required S3 configuration: S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION, and S3_BUCKET',
      );
    }

    return { accessKey, secret, region, bucket };
  }

  createS3Upload(): S3Upload {
    const { accessKey, secret, region, bucket } = this.getConfig();
    return new S3Upload({
      accessKey,
      secret,
      region,
      bucket,
    });
  }
}
