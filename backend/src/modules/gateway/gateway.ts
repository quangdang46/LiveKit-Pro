import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class MyGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    server.on('connection', (socket) => {
      console.log('Socket Id', socket.id);
    });
  }

  handleConnection(socket: Socket) {
    const { scriptId } = socket.handshake.query;
    if (scriptId) {
      socket.join(`script-${scriptId}`);
      console.log(`Client ${socket.id} joined room script-${scriptId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('process_number')
  newMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    const scriptId = client.handshake.query.scriptId as string;
    console.log('Received from script', scriptId, ':', body);

    this.server
      .to(`script-${scriptId}`)
      .emit('call_logs', `Script ${scriptId}: ${body}`);
  }
}
