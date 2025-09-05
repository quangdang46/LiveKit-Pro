import { Injectable, RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import {
  AccessToken,
  AgentDispatchClient,
  Room,
  RoomServiceClient,
  VideoGrant,
  WebhookReceiver,
  WebhookEvent,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly roomServiceClient: RoomServiceClient,
    private readonly agentDispatchClient: AgentDispatchClient,
    private readonly webhookReceiver: WebhookReceiver,
  ) {}

  async createAccessToken(room: string, participantName: string) {
    const at = new AccessToken(
      this.configService.get<string>('LIVEKIT_API_KEY'),
      this.configService.get<string>('LIVEKIT_API_SECRET'),
      {
        identity: participantName,
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
    console.log('access token', token);
    return token;
  }



  async dispatchAgentOnParticipantJoin(
    roomName: string,
    participantIdentity: string,
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
            type: 'participant-triggered',
          }),
        },
      );

      console.log(
        `Agent dispatched to room ${roomName} due to ${participantIdentity} joining,with dispatch ${JSON.stringify(dispatch)}`,
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
    console.log('event===>', event);
    if (
      event.event === 'participant_joined' &&
      !event.participant?.identity.includes('agent')
    ) {
      console.log(
        'dispatching agent for participant',
        event.participant?.identity,
      );

      await this.dispatchAgentOnParticipantJoin(
        event.room?.name!,
        event.participant?.identity!,
      );
    }

    return { success: true };
  }
}
