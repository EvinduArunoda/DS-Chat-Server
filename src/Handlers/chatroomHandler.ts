import { ChatroomService } from "../Services/chatroomService";
import { Socket } from "net";

export class ChatroomHandler {
    static list(sock: Socket): void {
        return ChatroomService.listChatrooms(sock);
    }

    static who(sock: Socket): boolean {
        return ChatroomService.listParticipants(sock);
    }

    static createRoom(data: any, sock: Socket): boolean {
        return ChatroomService.createRoom(data, sock);
    }

    static joinRoom(data: any, sock: Socket): boolean {
        return ChatroomService.joinRoom(data, sock);
    }

    static deleteRoom(data:any, sock:Socket): boolean {
        return ChatroomService.deleteRoom(data, sock);    
    }

    static moveJoin(data:any, sock:Socket): boolean {
        return ChatroomService.moveJoin(data, sock);    
    }
}