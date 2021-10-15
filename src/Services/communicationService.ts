import { Socket } from "net";
import { isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ChatroomService } from "./chatroomService";
import { ServerList } from "../Constants/servers";

export function checkClientExists(data: any, sock: Socket): boolean {
    const identity = data.identity
    // Check database
    if (ServiceLocator.database.clients && ServiceLocator.database.clients.includes(identity)) {
        writeJSONtoSocket(sock, { exists: true, type: "isclient", identity });
    } else {
        ServiceLocator.database.addClient(identity)
        console.log(ServiceLocator.database.clients)
        writeJSONtoSocket(sock, { exists: false, type: "isclient", identity });
        // Inform other servers
        broadcastServers({ type: "broadcastnewidentity", "approved": true, identity })
    }
    return true
}

export function checkChatroomExists(data: any, sock: Socket): boolean {
    const roomid = data.roomid
    const serverid = data.serverid
    // Check database
    if (ServiceLocator.database.chatRooms && ServiceLocator.database.chatRooms.has(roomid)) {
        writeJSONtoSocket(sock, { exists: true, type: "ischatroom", roomid });
    } else {
        ServiceLocator.database.addChatRoom(roomid, process.env.SERVER_ID as string)
        console.log(ServiceLocator.database.chatRooms)
        writeJSONtoSocket(sock, { exists: false, type: "ischatroom", roomid });
        // Inform other servers
        broadcastServers({ type: "broadcastcreateroom", "approved": true, roomid, serverid })
    }
    return true
}

export function getChatroomServer(data: any, sock: Socket): boolean {
    const roomid = data.roomid
    // Check database
    if (ServiceLocator.database.chatRooms && ServiceLocator.database.chatRooms.has(roomid)) {
        writeJSONtoSocket(sock, { serverid: ServiceLocator.database.chatRooms.get(roomid)?.toString(), type: "chatroomserver", roomid });
    } else {
        writeJSONtoSocket(sock, { serverid: undefined, type: "chatroomserver", roomid });
    }
    return true
}

export function saveNewIdentity(data: any) {
    const identity = data.identity
    ServiceLocator.database.addClient(identity)
}

export function saveNewChatRoom(data: any) {
    const roomid = data.roomid
    const serverid = data.serverid

    ServiceLocator.database.addChatRoom(roomid, serverid)
}

function broadcastServers(data: any) {
    const serverList = new ServerList()
    const socket = new Socket()
    serverList.getServerIds().filter(serverId => serverId !== process.env.SERVER_ID).forEach((serverId: string) => {
        const { host, port } = serverList.getServer(serverId);
        socket.connect(port, host)
        writeJSONtoSocket(socket, data);
    });
}
export function acknowledgeChatroomDeletion(data: any, sock: Socket): boolean {
    const roomid = data.roomid
    writeJSONtoSocket(sock, {acknowledged:true, type:"informroomdeletion", roomid});
    //broad cast to others
    return true
}

export function acknowledgeClientDeletion(data: any, sock: Socket): boolean {
    const identity = data.identity
    writeJSONtoSocket(sock, {acknowledged:true, type:"informclientdeletion", identity});
    //broad cast to others
    return true
}
