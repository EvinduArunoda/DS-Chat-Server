import { Socket } from "net";
import { CommunicationService } from "../Services/communicationService";

export class CommunicationHandler  {
    broadcastNewIdentity(data: any) {
        return CommunicationService.saveNewIdentity(data);
    }
    broadcastQuit(data: any) {
        return CommunicationService.deleteIdentity(data);
    }
    broadcastCreateroom(data: any) {
        return CommunicationService.saveNewChatRoom(data);
    }
    broadcastDeleteroom(data: any) {
        return CommunicationService.deleteChatRoom(data);
    }
}
