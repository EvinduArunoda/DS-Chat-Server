import { Socket } from "net";
import { getServerId, getServerIdNumber, isValidIdentity, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";
import { ServerList } from "../Constants/servers";
import { responseTypes } from "../Constants/responseTypes";

export class LeaderService {
    constructor() { }

    static async hasMajority(isHeartbeat: boolean = false): Promise<boolean> {
        // check if the leader has majority
        const serverList = new ServerList()
        //add all requests to promisesList
        const promisesList: Array<Promise<any>> = [];
        const hasMajorityNow = isHeartbeat && ServiceLocator.serversDAO.getAvailableServers().length >= new ServerList().getMajorityCount();

        serverList.getServerIds().filter(serverid => parseInt(serverid) != getServerIdNumber()).forEach((serverid: string) => {
            const { serverAddress: host, coordinationPort: port } = serverList.getServer(serverid);
            const socket = new Socket()
            socket.connect(port, host)
            socket.setTimeout(1000);
            writeJSONtoSocket(socket, { type: responseTypes.HEARTBEAT, leaderid: getServerId(), hasMajorityNow })
            const promise = new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    const { serverid, deletedClients, deletedChatrooms, restarted } = data
                    resolve({ serverid, deletedClients, deletedChatrooms, restarted })
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

        const values = await Promise.all(promisesList)

        const responses = values.filter(value => value !== null)
        const serverids: string[] = responses.map(res => res.serverid)

        if (hasMajorityNow) {
            ServiceLocator.serversDAO.incrementClock()
            // update db with responses
            for (const res of responses) {
                const { serverid, deletedClients, deletedChatrooms, restarted } = res
                // get the highest leader id with letest clock
                ServiceLocator.foreignChatroomsDAO.removeChatrooms(serverid, deletedChatrooms)
                ServiceLocator.foreignClientsDAO.removeClients(serverid, deletedClients)
                if (restarted) {
                    ServiceLocator.foreignClientsDAO.removeServer(serverid)
                    ServiceLocator.foreignClientsDAO.removeServer(serverid)
                }
            }
            // inform other servers
            LeaderService.broadcastServers({
                type: responseTypes.BROADCAST_SERVER_UPDATE,
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            })
        }
        // check if responses have a higher server id
        const hasHigherValue = serverids.filter(id => parseInt(id) > getServerIdNumber()).length > 0
        if (hasHigherValue) return false

        // update available server count
        ServiceLocator.serversDAO.updateAvailableServers(serverids)
        const hasMajority = serverids.length >= new ServerList().getMajorityCount()

        return hasMajority
    }

    static async checkClientExists(data: any, sock: Socket): Promise<boolean> {
        const { identity, serverid } = data
        // Check database
        if (ServiceLocator.foreignClientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, { acknowledged: true, exists: true, type: responseTypes.IS_CLIENT, identity });
            // check if the leader has majority
        } else if (await this.hasMajority()) {
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

    static async checkChatroomExists(data: any, sock: Socket): Promise<boolean> {
        const { roomid, serverid } = data
        // Check database
        if (ServiceLocator.foreignChatroomsDAO.isRegistered(roomid)) {
            writeJSONtoSocket(sock, { acknowledged: true, exists: true, type: responseTypes.IS_CHATROOM, roomid });
            // check if the leader has majority
        } else if (await this.hasMajority()) {
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

    static async acknowledgeChatroomDeletion(data: any, sock: Socket): Promise<boolean> {
        const { roomid, serverid } = data
        // check if the leader has majority
        if (await this.hasMajority()) {
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

    static async acknowledgeClientDeletion(data: any, sock: Socket): Promise<boolean> {
        const { identity, serverid } = data
        // check if the leader has majority
        if (await this.hasMajority()) {
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
