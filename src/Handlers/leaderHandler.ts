import { Socket } from "net";
import { LeaderService } from "../Services/leaderService";

export class LeaderHandler  {
    isClient(data: any, sock: Socket): boolean {
        return LeaderService.checkClientExists(data, sock);
    }
    isChatroom(data: any, sock: Socket): boolean {
        return LeaderService.checkChatroomExists(data, sock);
    }
    chatroomServer(data: any, sock: Socket): boolean {
        return LeaderService.getChatroomServer(data, sock);
    }
    informRoomDeletion(data: any, sock: Socket): boolean {
        return LeaderService.acknowledgeChatroomDeletion(data, sock);
    }
    informClientDeletion(data: any, sock: Socket): boolean {
        return LeaderService.acknowledgeClientDeletion(data, sock);
    }
}