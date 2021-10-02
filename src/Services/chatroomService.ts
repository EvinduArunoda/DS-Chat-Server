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
        console.log("ChatroomService.broadcast done...");
    }

    static listChatrooms(sock: Socket): void {
        const rooms = ServiceLocator.chatroomDAO.getRoomIds()
        // TODO: get list of chatrooms from the system
        writeJSONtoSocket(sock, { type: "roomlist", rooms });
        console.log("ChatroomService.listChatrooms done...");
    }

    static listLocalChatrooms(sock: Socket): void {
        const rooms = ServiceLocator.chatroomDAO.getRoomIds()
        writeJSONtoSocket(sock, { type: "roomlist", rooms });
        console.log("ChatroomService.listLocalChatrooms done...");
    }

    static listParticipants(sock: Socket): boolean {
        const roomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        if (!roomid) return false;
        const chatroom = ServiceLocator.chatroomDAO.getRoom(roomid);
        writeJSONtoSocket(sock, {
            type: "roomcontents",
            roomid,
            identities: Array.from(chatroom.participants),
            owner: chatroom.owner ?? ""
        });
        console.log("ChatroomService.listParticipants done...");
        return true
    }

    static createRoom(data: any, sock: Socket): boolean {
        const { roomid } = data;
        const previousRoomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        if (!previousRoomid || !identity) return false;
        // if the roomid is unique or if the client is not the owner of another chat room
        if (!isValidIdentity(roomid) || ServiceLocator.chatroomDAO.isOwner(identity, previousRoomid) || ServiceLocator.chatroomDAO.isRegisteredLocally(roomid)) {
            writeJSONtoSocket(sock, { type: "createroom", roomid, approved: "false" });
        } else {
            // TODO: Check id in other servers
            ServiceLocator.chatroomDAO.addNewChatroom(previousRoomid, roomid, identity);
            // TODO: inform other servers
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            writeJSONtoSocket(sock, { type: "createroom", roomid, approved: "true" });
            // broadcast to previous room
            ChatroomService.broadbast(previousRoomid, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
            // send to client itself
            writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
        }
        console.log("ChatroomService.createRoom done...");
        return true;
    }

    static joinRoom(data: any, sock: Socket): boolean {
        const { roomid } = data;
        const previousRoomid = ServiceLocator.clientsDAO.getClient(sock)?.roomId;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock)
        if (!previousRoomid || !identity) return false;
        // if the client is not the owner of another chat room
        if (!isValidIdentity(roomid) || ServiceLocator.chatroomDAO.isOwner(identity, previousRoomid)) {
            writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: roomid, roomid: roomid });
        // if the room is in same server
        } else if (ServiceLocator.chatroomDAO.isRegisteredLocally(roomid)){
            ServiceLocator.clientsDAO.joinChatroom(roomid, identity);
            // broadcast to previous room
            ChatroomService.broadbast(previousRoomid, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
            // broadcast to new room
            ChatroomService.broadbast(roomid, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
            // send to client itself
            writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
        } else {
            // TODO: check if the room is in another server
            // TODO: remove from previous room
            // broadcast to previous room
            ChatroomService.broadbast(previousRoomid, { type: "roomchange", identity: identity, former: previousRoomid, roomid });
            // TODO: add to new server room
        }
        return true;
    }

    static deleteRoom(data: any, sock: Socket): boolean {
        // TODO: need to fix this(delete chatroom)
        console.log('here 1')
        const { roomid } = data;
        const identity = ServiceLocator.clientsDAO.getIdentity(sock);
        if (!identity) return false;
        // check if the user is the owner of the chatroom
        if (isValidIdentity(roomid) && ServiceLocator.chatroomDAO.isOwner(identity, roomid)) {
            console.log('here 2')
            const participants = ServiceLocator.chatroomDAO.getParticipants(roomid);
            const mainHallIdentiry = `MainHall-s${process.env.SERVER_ID}`;
            // move all participants to the MainHall
            for (const participant of participants) {
                ServiceLocator.clientsDAO.moveToMainHall(participant);
                // broadcast to previous room
                ChatroomService.broadbast(roomid, { type: "roomchange", identity: participant, former: roomid, mainHallIdentiry });
            }
            writeJSONtoSocket(sock, { type: "roomchange", identity: identity, former: roomid, mainHallIdentiry });
            // delete chatroom
            ServiceLocator.chatroomDAO.deleteChatroom(roomid);
        } else {
            return false;
        }
        return true;
    }
}