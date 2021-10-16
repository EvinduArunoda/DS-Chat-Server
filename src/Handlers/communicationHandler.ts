import { Socket } from "net";
import { CommunicationService } from "../Services/communicationService";

export class CommunicationHandler  {
    broadcastNewIdentity(data: any) {
        return CommunicationService.saveNewIdentity(data);
    }
    broadcastCreateroom(data: any) {
        return CommunicationService.saveNewChatRoom(data);
    }
}