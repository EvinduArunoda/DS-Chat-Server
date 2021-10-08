import { Socket } from "net";
import { isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";

export class ClientService {
    private constructor() { }

    static registerClient(data: any, sock: Socket): boolean {
        const { identity } = data;
        if (!isValidIdentity(identity) || ServiceLocator.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { type: "newidentity", approved: "false" });
        } else {
            // TODO: Check id in other servers
            ServiceLocator.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, { type: "newidentity", approved: "true" });
            // TODO: inform other servers
            ServiceLocator.chatroomDAO.addParticipantDefault(identity);
            // broadcast message
            ChatroomService.broadbast(`MainHall-s${process.env.SERVER_ID}`, { type: "roomchange", identity: identity, former: "", roomid: `MainHall-s${process.env.SERVER_ID}` });
        }
        return true
    }

    static removeClient(sock: Socket): boolean {
        const previousRoomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        // TODO: Check whether client is the owner of the room
        writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: previousRoomid, roomid: '' });
        return ServiceLocator.clientsDAO.removeClient(sock);
    }
}