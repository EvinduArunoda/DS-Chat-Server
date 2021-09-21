import { ChatroomService } from "../Services/chatroomService";
import { Socket } from "net";

export class ChatroomHandler {
    static listChatrooms(sock: Socket): void {
        return ChatroomService.listChatrooms(sock);
    }

    static listParticipants(sock: Socket): boolean {
        return ChatroomService.listParticipants(sock);
    }
}