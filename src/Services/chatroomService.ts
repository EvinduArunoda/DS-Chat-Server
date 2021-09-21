import { isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
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
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
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

    static createRoom(data: any, sock: Socket): boolean {
        const { roomid } = data;
        const previousRoomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        if (!previousRoomid || !identity) return false;
        if (!isValidIdentity(roomid) || ServiceLocator.chatroomDAO.isOwner(identity, previousRoomid) || ServiceLocator.chatroomDAO.isRegistered(roomid)
        ) {
            writeJSONtoSocket(sock, { type: "createroom", roomid, approved: "false" });
        } else {
            // TODO: Check id in other servers
            ServiceLocator.chatroomDAO.addNewChatroom(previousRoomid, roomid, identity);
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            writeJSONtoSocket(sock, { type: "createroom", roomid, approved: "true" });
            // TODO: inform other servers
            // broadcast to previous room
            ChatroomService.broadbast(previousRoomid, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
            writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
        }
        return true;
    }
}