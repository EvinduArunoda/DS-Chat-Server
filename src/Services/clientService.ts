import { Socket } from "net";
import { getMainHallId, isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";
import { responseTypes } from "../Constants/responseTypes";

export class ClientService {
    private constructor() { }

    static registerClient(data: any, sock: Socket): boolean {
        const { identity } = data;
        if (!isValidIdentity(identity) || ServiceLocator.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { type: responseTypes.NEW_IDENTITY, approved: "false" });
        } else {
            // TODO: Check id in other servers
            ServiceLocator.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, { type: responseTypes.NEW_IDENTITY, approved: "true" });
            // TODO: inform other servers
            ServiceLocator.chatroomDAO.addParticipantDefault(identity);

            // broadcast message
            ChatroomService.broadbast(getMainHallId(), { type: responseTypes.ROOM_CHANGE, identity: identity, former: "", roomid: getMainHallId() });
        }
        console.log("ClientService.registerClient done...");
        return true
    }

    static removeClient(sock: Socket): boolean {
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock);
        if (!roomid || !identity) return false;
        // if the client is owner of a chatroom
        if (ServiceLocator.chatroomDAO.isOwner(identity, roomid)) {
            // delete room
            const participants = ServiceLocator.chatroomDAO.getParticipants(roomid);
            const mainHallId = getMainHallId();
            // move all participants to the MainHall
            participants.forEach((participant: string) => {
                // move client to the mainHall
                ServiceLocator.clientsDAO.joinChatroom(mainHallId, participant);
                ServiceLocator.chatroomDAO.changeChatroom(identity, roomid, mainHallId);
                // broadcast to previous room
                ChatroomService.broadbast(roomid, { type: responseTypes.ROOM_CHANGE, identity: participant, former: "", roomid: mainHallId });
                // broadcast to mainhall
                ChatroomService.broadbast(mainHallId, { type: responseTypes.ROOM_CHANGE, identity: participant, "": roomid, roomid: mainHallId });
            })
            // delete chatroom
            ServiceLocator.chatroomDAO.deleteChatroom(roomid);
            // TODO: inform other servers
        } else {
            // leave chatroom
            ServiceLocator.chatroomDAO.removeParticipant(roomid, identity);
            // broadcast to previous room
            ChatroomService.broadbast(roomid, { type: responseTypes.ROOM_CHANGE, identity, former: roomid, roomid: "" });
        }
        // remove from client list
        ServiceLocator.clientsDAO.removeClient(sock);
        // TODO: inform other servers
        // TODO: delete connection
        console.log("ClientService.removeClient done...");
        return true;
    }
}