import { getMainHallId, isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { CommunicationService } from "./communicationService";
import { ServerList } from "../Constants/servers";

export class ChatroomService {
    private constructor() { }

    static broadcast(roomid: string, message: any): void {
        const participants = ServiceLocator.chatroomDAO.getParticipants(roomid);
        // get sockets
        const clients = ServiceLocator.clientsDAO.getClientsFromId(participants)
        // broeadcast
        clients.forEach(client => {
            writeJSONtoSocket(client.socket, message);
        })
        console.log("ChatroomService.broadcast done...");
    }

    static broadcastExceptSender(roomid: string, message: any, senderId: string):void {
        const participants = ServiceLocator.chatroomDAO.getParticipants(roomid);
        // get sockets
        const clients = ServiceLocator.clientsDAO.getClientsFromId(participants.filter(el => el !== senderId))
        // broeadcast
        clients.forEach(client => {
            writeJSONtoSocket(client.socket, message);
        })
        console.log("ChatroomService.broadcast done...");
    }

    static listChatrooms(sock: Socket): void {
        // const rooms = ServiceLocator.chatroomDAO.getRoomIds()
        const rooms = ServiceLocator.foreignChatroomsDAO.getRoomIds()
        writeJSONtoSocket(sock, { type: responseTypes.ROOMLIST, rooms });
        // TODO: ask from leader. if leader is not avaialble show local chatrooms
        console.log("ChatroomService.listChatrooms done...");
    }

    static listLocalChatrooms(sock: Socket): void {
        const rooms = ServiceLocator.chatroomDAO.getRoomIds()
        writeJSONtoSocket(sock, { type: responseTypes.ROOMLIST, rooms });
        console.log("ChatroomService.listLocalChatrooms done...");
    }

    static listParticipants(sock: Socket): boolean {
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomid;
        if (!roomid) return false;
        const chatroom = ServiceLocator.chatroomDAO.getRoom(roomid);
        writeJSONtoSocket(sock, {
            type: responseTypes.ROOM_CONTENTS,
            roomid,
            identities: Array.from(chatroom.participants),
            owner: chatroom.owner ?? ""
        });
        console.log("ChatroomService.listParticipants done...");
        return true
    }

    static async createRoom(data: any, sock: Socket): Promise<boolean> {
        const { roomid } = data;
        const former = ServiceLocator.clientsDAO.getClient(sock)?.roomid;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        if (!former || !identity) return false;
        // if the roomid is unique or if the client is not the owner of another chat room
        if (!isValidIdentity(roomid) || ServiceLocator.chatroomDAO.isOwner(identity, former) || ServiceLocator.chatroomDAO.isRegistered(roomid)) {
            writeJSONtoSocket(sock, { type: responseTypes.CREATE_ROOM, roomid, approved: "false" });
        // check if id is unique and inform other servers
        } else if (await CommunicationService.isChatroomRegistered(roomid)){
            writeJSONtoSocket(sock, { type: responseTypes.CREATE_ROOM, roomid, approved: "false" });
        }
        else {
            ServiceLocator.chatroomDAO.addNewChatroom(former, roomid, identity);
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            writeJSONtoSocket(sock, { type: responseTypes.CREATE_ROOM, roomid, approved: "true" });
            // broadcast to previous room
            ChatroomService.broadcast(former, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
            // send to client itself
            writeJSONtoSocket(sock, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
        }
        console.log("ChatroomService.createRoom done...");
        return true;
    }

    static async joinRoom(data: any, sock: Socket): Promise<boolean> {
        const { roomid } = data;
        const former = ServiceLocator.clientsDAO.getClient(sock)?.roomid;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        if (!former || !identity) return false;
        // if the client is not the owner of another chat room
        if (ServiceLocator.chatroomDAO.isOwner(identity, former)) {
            writeJSONtoSocket(sock, { type: responseTypes.ROOM_CHANGE, identity, former: former, roomid: former });
        // if the room is in same server
        } else if (ServiceLocator.chatroomDAO.isRegistered(roomid)) {
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            ServiceLocator.chatroomDAO.changeChatroom(identity, former, roomid);
            // broadcast to previous room
            ChatroomService.broadcast(former, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
            // broadcast to new room
            ChatroomService.broadcast(roomid, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
        } else {
            const serverid = await CommunicationService.getChatroomRegisteredServer(roomid);
            console.log(serverid)
            // check if the room is in another server
            if (!!serverid) {
                // remove from previous room
                ServiceLocator.chatroomDAO.removeParticipant(former, identity);
                // remove from client list
                ServiceLocator.clientsDAO.removeClient(sock);
                // inform other servers
                await CommunicationService.informClientDeletion(identity);                // broadcast to previous room
                ChatroomService.broadcast(former, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
                // redirect to new server room
                const {address :host, clientsPort: port} = new ServerList().getServer(serverid);
                writeJSONtoSocket(sock, {type: responseTypes.ROUTE, roomid, host, port: port.toString()})
            } else {
                writeJSONtoSocket(sock, { type: responseTypes.ROOM_CHANGE, identity, former: former, roomid: former });
            }
        }
        return true;
    }

    static moveJoin(data: any, sock: Socket): boolean {
        const { roomid, identity, former } = data;
        if (!former || !identity || !roomid) return false;
        // add client to new server
        ServiceLocator.clientsDAO.addNewClient(identity, sock);
        // if the room does not exist
        if (!ServiceLocator.chatroomDAO.isRegistered(roomid)) {
            // add to mainhall
            const mainHallId = getMainHallId();
            ServiceLocator.clientsDAO.joinChatroom(mainHallId, identity);
            // broadcast to mainhall
            ChatroomService.broadcast(mainHallId, { type: responseTypes.ROOM_CHANGE, identity, former, roomid: mainHallId });
            // send to client itself
            writeJSONtoSocket(sock, { type: responseTypes.ROOM_CHANGE, identity, former, roomid: mainHallId });
        // if the room is available
        } else {
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            ServiceLocator.chatroomDAO.changeChatroom(identity, former, roomid);
            // send to client itself
            writeJSONtoSocket(sock, {type : "serverchange", "approved" : "true", "serverid" : process.env.SERVER_ID});
            console.log('Here is me')
            // broadcast to new room
            ChatroomService.broadcast(roomid, { type: responseTypes.ROOM_CHANGE, identity, former, roomid });
        }
        return true;
    }

    static async deleteRoom(data: any, sock: Socket): Promise<boolean> {
        const { roomid } = data;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock);
        if (!identity) return false;
        // check if the user is the owner of the chatroom
        if (!isValidIdentity(roomid) || !ServiceLocator.chatroomDAO.isOwner(identity, roomid)) {
            writeJSONtoSocket(sock, { type: responseTypes.DELETE_ROOM, roomid, approved: "false" });
            // if the room is in same server
        } else if (ServiceLocator.chatroomDAO.isRegistered(roomid)) {
            const participants = ServiceLocator.chatroomDAO.getParticipants(roomid);
            const mainHallId = getMainHallId();
            // move all participants to the MainHall
            participants.forEach((participant: string) => {
                // move client to the mainHall
                ServiceLocator.clientsDAO.joinChatroom(mainHallId, participant);
                ServiceLocator.chatroomDAO.changeChatroom(participant, roomid, mainHallId);
                // broadcast to previous room
                ChatroomService.broadcast(roomid, { type: responseTypes.ROOM_CHANGE, identity: participant, former: roomid, roomid: mainHallId });
                // broadcast to mainhall
                ChatroomService.broadcast(mainHallId, { type: responseTypes.ROOM_CHANGE, identity: participant, former: roomid, roomid: mainHallId });
            })
            // delete chatroom
            ServiceLocator.chatroomDAO.deleteChatroom(roomid);
            // inform other servers
            await CommunicationService.informChatroomDeletion(roomid);
            writeJSONtoSocket(sock, { type: responseTypes.DELETE_ROOM, roomid, approved: "true" });
        }
        return true;
    }

    static message(data: any, sock: Socket): boolean {
        const { content } = data;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock);
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomid;
        if (!content || !roomid || !identity) return false;
        // broadcast to all members in chatroom
        ChatroomService.broadcastExceptSender(roomid, { type: responseTypes.MESSAGE, identity, content }, identity)
        return true;
    }

}
