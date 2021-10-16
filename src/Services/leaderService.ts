import { Socket } from "net";
import { getServerId, isValidIdentity, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ServerList } from "../Constants/servers";
import { responseTypes } from "../Constants/responseTypes";

export class LeaderService {
    constructor() { }

    static checkClientExists(data: any, sock: Socket): boolean {
        const { identity, serverid } = data
        // Check database
        if (ServiceLocator.foreignClientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { exists: true, type: responseTypes.IS_CLIENT, identity });
        } else {
            ServiceLocator.foreignClientsDAO.addNewClient(serverid, identity)
            writeJSONtoSocket(sock, { exists: false, type: responseTypes.IS_CLIENT, identity });
            // Inform other servers
            LeaderService.broadcastServers({ type: responseTypes.BROADCAST_NEWIDENTITY, approved: true, identity, serverid })
        }
        return true
    }

    static checkChatroomExists(data: any, sock: Socket): boolean {
        const { roomid, serverid } = data
        // Check database
        if (ServiceLocator.foreignChatroomsDAO.isRegistered(roomid)) {
            writeJSONtoSocket(sock, { exists: true, type: responseTypes.IS_CHATROOM, roomid });
        } else {
            ServiceLocator.foreignChatroomsDAO.addNewChatroom(serverid, roomid)
            writeJSONtoSocket(sock, { exists: false, type: responseTypes.IS_CHATROOM, roomid });
            // Inform other servers
            LeaderService.broadcastServers({ type: responseTypes.BROADCAST_CREATEROOM, approved: true, roomid, serverid })
        }
        return true
    }

    static getChatroomServer(data: any, sock: Socket): boolean {
        const { roomid } = data
        // Check database
        const serverid = ServiceLocator.foreignChatroomsDAO.getChatroomServer(roomid)
        writeJSONtoSocket(sock, { serverid, type: responseTypes.CHATROOM_SERVER, roomid });
        return true
    }

    private static broadcastServers(data: any) {
        const serverList = new ServerList()
        serverList.getServerIds().filter(serverId => serverId !== getServerId()).forEach((serverId: string) => {
            const { host, port } = serverList.getServer(serverId);
            const socket = new Socket()
            console.log(host, port)
            socket.connect(port, host)
            writeJSONtoSocket(socket, data);
            socket.on('error', (err) => {
                console.log(err.message)
            })
        });
    }

    static acknowledgeChatroomDeletion(data: any, sock: Socket): boolean {
        const { roomid, serverid } = data
        ServiceLocator.foreignChatroomsDAO.removeChatroom(serverid, roomid);
        writeJSONtoSocket(sock, { acknowledged: true, type: responseTypes.INFORM_ROOMDELETION, roomid });
        LeaderService.broadcastServers({ type: responseTypes.BROADCAST_DELETEROOM, roomid, serverid })
        return true
    }

    static acknowledgeClientDeletion(data: any, sock: Socket): boolean {
        const { identity, serverid } = data
        ServiceLocator.foreignClientsDAO.removeClient(serverid, identity);
        writeJSONtoSocket(sock, { acknowledged: true, type: responseTypes.INFORM_CLIENTDELETION, identity });
        LeaderService.broadcastServers({ type: responseTypes.BROADCAST_QUIT, identity, serverid })
        return true
    }
}
