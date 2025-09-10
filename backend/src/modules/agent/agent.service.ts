import { Injectable, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import {
  AccessToken,
  AgentDispatchClient,
  VideoGrant,
  WebhookReceiver,
  WebhookEvent,
  RoomServiceClient,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly agentDispatchClient: AgentDispatchClient,
    private readonly webhookReceiver: WebhookReceiver,
    private readonly room: RoomServiceClient,
  ) {}

  async createAccessToken(
    room: string,
    participantName: string,
    scriptId: string,
  ) {
    const at = new AccessToken(
      this.configService.get<string>('LIVEKIT_API_KEY'),
      this.configService.get<string>('LIVEKIT_API_SECRET'),
      {
        identity: participantName,
        metadata: JSON.stringify({
          scriptId,
          room,
        }),
      },
    );
    const videoGrant: VideoGrant = {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(videoGrant);
    const token = await at.toJwt();
    return token;
  }

  async dispatchAgentOnParticipantJoin(
    roomName: string,
    participantIdentity: string,
    scriptId: string,
  ): Promise<string | null> {
    if (participantIdentity.includes('agent')) {
      return null;
    }
    try {
      const dispatch = await this.agentDispatchClient.createDispatch(
        roomName,

        // agent name ai-agent-001....002
        `ai-agent-00${Math.floor(Math.random() * 2) + 1}`,
        {
          metadata: JSON.stringify({
            roomName,
            triggerParticipant: participantIdentity,
            dispatchTime: new Date().toISOString(),
            scriptId,
          }),
        },
      );

      return 'ai-agent';
    } catch (error) {
      console.error('Agent dispatch failed:', error.message);
      return null;
    }
  }

  async webhook(req: RawBodyRequest<Request>, authHeader: string) {
    const rawBuffer = Buffer.isBuffer(req.body)
      ? (req.body as Buffer)
      : Buffer.from((req as any).rawBody ?? JSON.stringify(req.body ?? {}));

    const event = (await this.webhookReceiver.receive(
      rawBuffer.toString('utf8'),
      authHeader,
    )) as WebhookEvent;
    if (
      event.event === 'participant_joined' &&
      !event.participant?.identity.includes('agent')
    ) {
      const metadata = event.participant?.metadata;
      if (metadata) {
        const parsed = JSON.parse(metadata);
        console.log(
          'Participant joined with scriptId:===========>',
          parsed.scriptId,
        );
        await this.dispatchAgentOnParticipantJoin(
          event.room?.name!,
          event.participant?.identity!,
          parsed.scriptId,
        );
      }
    }

    if (event.event === 'participant_left' || event.event === 'room_finished') {
      const metadata = event.participant?.metadata;
      if (metadata) {
        const parsed = JSON.parse(metadata);
        await this.room.deleteRoom(parsed.room);
      }
    }

    if (event.event === 'track_published') {
      console.log('track_published===>', event);
    }

    return { success: true };
  }
}
