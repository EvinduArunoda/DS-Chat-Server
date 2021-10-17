import { Socket } from "net";
import { CommunicationService } from "../Services/communicationService";

export class CommunicationHandler  {
    broadcastNewIdentity(data: any) {
        return CommunicationService.saveNewIdentity(data);
    }
    broadcastCreateroom(data: any) {
        return CommunicationService.saveNewChatRoom(data);
    }
    broadcastDeleteroom(data: any) {
        return CommunicationService.deleteRoom(data);
    }
    broadcastQuit(data: any) {
        return CommunicationService.deleteClient(data);
    }
}
