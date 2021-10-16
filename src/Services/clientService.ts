import { Socket } from "net";
import { getMainHallId, isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";
import { responseTypes } from "../Constants/responseTypes";
import { CommunicationService } from "./communicationService";

export class ClientService {
    private constructor() { }

     static async registerClient(data: any, sock: Socket): Promise<boolean> {
        const { identity } = data;
        if (!isValidIdentity(identity) || ServiceLocator.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { type: responseTypes.NEW_IDENTITY, approved: "false" });
        // check if id is unique and inform other servers
        } else if(await CommunicationService.isClientRegistered(identity)) {
            writeJSONtoSocket(sock, { type: responseTypes.NEW_IDENTITY, approved: "false" });
        } else {
            ServiceLocator.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, { type: responseTypes.NEW_IDENTITY, approved: "true" });
            ServiceLocator.chatroomDAO.addParticipantDefault(identity);

            // broadcast message
            ChatroomService.broadcast(getMainHallId(), { type: responseTypes.ROOM_CHANGE, identity: identity, former: "", roomid: getMainHallId() });
        }
        console.log("ClientService.registerClient done...");
        return true
    }

    static async removeClient(sock: Socket, forced: boolean): Promise<boolean> {
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomid;
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
                ChatroomService.broadcast(roomid, { type: responseTypes.ROOM_CHANGE, identity: participant, former: "", roomid: mainHallId });
                // broadcast to mainhall
                ChatroomService.broadcast(mainHallId, { type: responseTypes.ROOM_CHANGE, identity: participant, former: "", roomid: mainHallId });
            })
            // delete chatroom
            ServiceLocator.chatroomDAO.deleteChatroom(roomid);
            // inform other servers
            CommunicationService.informChatroomDeletion(roomid);
        } else {
            // leave chatroom
            ServiceLocator.chatroomDAO.removeParticipant(roomid, identity);
            // broadcast to previous room
            ChatroomService.broadcast(roomid, { type: responseTypes.ROOM_CHANGE, identity, former: roomid, roomid: "" });
        }
        // remove from client list
        ServiceLocator.clientsDAO.removeClient(sock);
        // inform other servers
        await CommunicationService.informClientDeletion(identity);
        if (!forced) {
            // delete connection
            writeJSONtoSocket(sock, { type: responseTypes.ROOM_CHANGE, identity: identity, former: roomid, roomid: "" });
        }
        console.log("ClientService.removeClient done...");
        return true;
    }
}
