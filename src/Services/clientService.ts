import { Socket } from "net";
import { writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";

export class ClientService {
    constructor() { }

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;
        if (ServiceLocator.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { type: "newidentity", approved: "false" });
            return false
        } else {
            // TODO: Check id in other servers
            ServiceLocator.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, { type: "newidentity", approved: "true" });
            // TODO: inform other servers
            ServiceLocator.chatroomDAO.addParticipantDefault(identity);
            // broadcast message
            ChatroomService.broadbast(`MainHall-s${process.env.SERVER_ID}`, { type: "roomchange", identity: identity, former: "", roomid: `MainHall-s${process.env.SERVER_ID}` });
            return true
        }
    }

    removeClient(sock: Socket): boolean {
        return ServiceLocator.clientsDAO.removeClient(sock);
    }
}