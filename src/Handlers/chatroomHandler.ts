import { ChatroomService } from "../Services/chatroomService";
import { Socket } from "net";

export class ChatroomHandler {
    list(sock: Socket): void {
        return ChatroomService.listChatrooms(sock);
    }

    who(sock: Socket): boolean {
        return ChatroomService.listParticipants(sock);
    }

    createRoom(data: any, sock: Socket): boolean {
        return ChatroomService.createRoom(data, sock);
    }

    joinRoom(data: any, sock: Socket): boolean {
        return ChatroomService.joinRoom(data, sock);
    }

    deleteRoom(data:any, sock:Socket): boolean {
        return ChatroomService.deleteRoom(data, sock);    
    }

    moveJoin(data:any, sock:Socket): boolean {
        return ChatroomService.moveJoin(data, sock);    
    }

    message(data:any, sock:Socket): boolean {
        return ChatroomService.message(data, sock);    
    }
}