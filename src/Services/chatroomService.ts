import { writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { Socket } from "net";

export class ChatroomService {
    private constructor() { }

    static broadbast(roomId: string, message: any): void {
        const participants = ServiceLocator.chatroomDAO.getParticipants(roomId);
        // get sockets
        const clients = ServiceLocator.clientsDAO.getClientsFromId(participants)
        // broeadcast
        clients.forEach(client => {
            writeJSONtoSocket(client.socket, message);
        })
    }

    static listChatrooms(sock: Socket): void {
        const rooms = ServiceLocator.chatroomDAO.getRoomIds()
        // TODO: get list of chatrooms from the system
        writeJSONtoSocket(sock, { type: "roomlist", rooms });
    }

    static listParticipants(sock: Socket): boolean {
        const roomid = ServiceLocator.clientsDAO.getRoomId(sock);
        if (!roomid) return false;
        const chatroom = ServiceLocator.chatroomDAO.getRoom(roomid);
        writeJSONtoSocket(sock, {
            type: "roomcontents",
            roomid,
            identities: chatroom.participants,
            owner: chatroom.owner ?? ""
        });
        return true
    }
}