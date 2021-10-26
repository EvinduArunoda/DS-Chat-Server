import { Socket } from "net";
import { getServerId, isValidIdentity, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ServerList } from "../Constants/servers";
import { responseTypes } from "../Constants/responseTypes";

export class LeaderService {
    constructor() { }

    static hasMajority(): boolean {
        // check if the leader has majority
        const serverList = new ServerList()
        //add all requests to promisesList
        const promisesList: Array<Promise<any>> = [];

        serverList.getServerIds().filter(serverid => parseInt(serverid) != parseInt(getServerId())).forEach((serverid: string) => {
            const { serverAddress: host, coordinationPort: port } = serverList.getServer(serverid);
            const socket = new Socket()
            socket.connect(port, host)
            socket.setTimeout(1000);
            writeJSONtoSocket(socket, { type: responseTypes.HEARTBEAT, leaderid: getServerId(), clock: ServiceLocator.serversDAO.getClock(), })
            const promise = new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data: {serverid: string} = readJSONfromBuffer(buffer);
                    const { serverid } = data
                    resolve({ serverid })
                    socket.end()
                });
                // server does not response
                socket.on('timeout', () => {
                    resolve(null)
                    socket.end()
                });

                socket.on('error', (err) => {
                    console.log(' request leader id broadcast error:', err.message)
                    resolve(null)
                    socket.end()
                })
            });
            promisesList.push(promise);
        });

        let hasMajority = false

        Promise.all(promisesList).then((values) => {
            const serverids: string[] = values.filter(value => value !== null).map(res => res.serverid)
            // check if responses have a higher server id
            const hasHigherValue = serverids.filter(id => parseInt(id) > parseInt(getServerId())).length > 0
            if (hasHigherValue) return

            // update available server count
            ServiceLocator.serversDAO.updateAvailableServers(serverids)
            hasMajority =  serverids.length >= new ServerList().getMajorityCount()
        });

        return hasMajority
    }

    static checkClientExists(data: any, sock: Socket): boolean {
        const { identity, serverid } = data
        // Check database
        if (ServiceLocator.foreignClientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { acknowledged: true, exists: true, type: responseTypes.IS_CLIENT, identity });
            // check if the leader has majority
        } else if (this.hasMajority()) {
            ServiceLocator.serversDAO.incrementClock()
            ServiceLocator.foreignClientsDAO.addNewClient(serverid, identity)
            writeJSONtoSocket(sock, { acknowledged: true, exists: false, type: responseTypes.IS_CLIENT, identity });
            // Inform other servers
            LeaderService.broadcastServers({
                type: responseTypes.BROADCAST_SERVER_UPDATE,
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            })
        } else {
            writeJSONtoSocket(sock, { acknowledged: false, exists: false, type: responseTypes.IS_CLIENT, identity });
        }
        return true
    }

    static checkChatroomExists(data: any, sock: Socket): boolean {
        const { roomid, serverid } = data
        // Check database
        if (ServiceLocator.foreignChatroomsDAO.isRegistered(roomid)) {
            writeJSONtoSocket(sock, { acknowledged: true, exists: true, type: responseTypes.IS_CHATROOM, roomid });
            // check if the leader has majority
        } else if (this.hasMajority()) {
            ServiceLocator.serversDAO.incrementClock()
            ServiceLocator.foreignChatroomsDAO.addNewChatroom(serverid, roomid)
            writeJSONtoSocket(sock, { acknowledged: true, exists: false, type: responseTypes.IS_CHATROOM, roomid });
            // Inform other servers
            LeaderService.broadcastServers({
                type: responseTypes.BROADCAST_SERVER_UPDATE,
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            })
        } else {
            writeJSONtoSocket(sock, { acknowledged: false, exists: false, type: responseTypes.IS_CHATROOM, roomid });
        }
        return true
    }

    static getChatroomServer(data: any, sock: Socket): boolean {
        const { roomid } = data
        // Check database
        const availableServers = ServiceLocator.serversDAO.getAvailableServers();
        const serverid = ServiceLocator.foreignChatroomsDAO.getChatroomServer(roomid, availableServers)
        writeJSONtoSocket(sock, { serverid, type: responseTypes.CHATROOM_SERVER, roomid });
        return true
    }

    static broadcastServers(data: any) {
        const serverList = new ServerList()
        serverList.getServerIds().filter(serverid => serverid != getServerId()).forEach((serverid: string) => {
            const { serverAddress: host, coordinationPort: port } = serverList.getServer(serverid);
            const socket = new Socket()
            socket.connect(port, host)
            writeJSONtoSocket(socket, data);
            socket.on('error', (err) => {
                console.log('broadcast error:', err.message)
                socket.end()
            })
        });
    }

    static acknowledgeChatroomDeletion(data: any, sock: Socket): boolean {
        const { roomid, serverid } = data
        // check if the leader has majority
        if (this.hasMajority()) {
            ServiceLocator.serversDAO.incrementClock()
            ServiceLocator.foreignChatroomsDAO.removeChatroom(serverid, roomid);
            writeJSONtoSocket(sock, { acknowledged: true, type: responseTypes.INFORM_ROOMDELETION, roomid });
            // inform other servers
            LeaderService.broadcastServers({
                type: responseTypes.BROADCAST_SERVER_UPDATE,
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            })
        } else {
            writeJSONtoSocket(sock, { acknowledged: false, type: responseTypes.INFORM_ROOMDELETION, roomid });
        }
        return true
    }

    static acknowledgeClientDeletion(data: any, sock: Socket): boolean {
        const { identity, serverid } = data
        // check if the leader has majority
        if (this.hasMajority()) {
            ServiceLocator.serversDAO.incrementClock()
            ServiceLocator.foreignClientsDAO.removeClient(serverid, identity);
            writeJSONtoSocket(sock, { acknowledged: true, type: responseTypes.INFORM_CLIENTDELETION, identity });
            // inform other servers
            LeaderService.broadcastServers({
                type: responseTypes.BROADCAST_SERVER_UPDATE,
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            })
        } else {
            writeJSONtoSocket(sock, { acknowledged: false, type: responseTypes.INFORM_CLIENTDELETION, identity });
        }
        return true
    }

    static provideLeaderState(sock: Socket): boolean {
        writeJSONtoSocket(sock, {
            type: responseTypes.REQUEST_DATA,
            leaderid: ServiceLocator.serversDAO.getLeaderId(),
            clock: ServiceLocator.serversDAO.getClock(),
            clients: ServiceLocator.foreignClientsDAO.getClients(),
            chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
        })
        return true
    }
}
