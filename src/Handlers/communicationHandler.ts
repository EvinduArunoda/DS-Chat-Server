import { Socket } from "net";
import { CommunicationService } from "../Services/communicationService";

export class CommunicationHandler  {
    broadcastServerUpdate(data: any) {
        return CommunicationService.saveUpdate(data);
    }

    respondHeartBeat(data: any, sock: Socket) {
        return CommunicationService.respondHeartBeat(data, sock);
    }
}
