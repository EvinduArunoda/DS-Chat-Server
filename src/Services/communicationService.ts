import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import {LeaderService} from "./leaderService";
import {ElectionService} from "./electionService";

export class CommunicationService {
    constructor() { }

    static async isClientRegistered(identity: string): Promise<any> {
        // check if the server is the leader before connecting
        // Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'isclient', identity: identity, serverid: serverid }
        console.log('IS CLIENT REGISTERED ')
        const socket = new Socket()
        const leaderId = ServiceLocator.leaderDAO.getLeaderId()
        const { host: leaderAddress, port: leaderPort } = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.IS_CLIENT, identity, serverid: getServerId() })


        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                if (data.exists) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            });

            socket.on('error', async () => {
                console.log('IS CLIENT REGISTERED SOCKET ERROR*')
                const res = await ElectionService.startElection();
                resolve(await this.isClientRegistered(identity))
            });
            socket.end();
        })
    }

    static isChatroomRegistered(roomid: string): Promise<boolean> {
        // check if the server is the leader before connecting
        // Check if room id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'ischatroom', roomid: roomid, serverid: serverid}
        const socket = new Socket()
        const leaderId = ServiceLocator.leaderDAO.getLeaderId()
        const { host: leaderAddress, port: leaderPort } = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.IS_CHATROOM, roomid, serverid: getServerId() })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                if (data.exists) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            });

            socket.on('error', (error) => {
                ElectionService.startElection().then(() => {
                    resolve(CommunicationService.isChatroomRegistered(roomid))
                })
                .catch(err => {
                    console.log('error', err.message)
                })
            });
            socket.end();
        })
    }

    static getChatroomRegisteredServer(roomid: string): Promise<string | undefined> {
        // check if the server is the leader before connecting
        // check if the room is in another server
        // return server id
        // return undefined if not found
        // {type:'chatroomserver', roomid:roomid}
        const socket = new Socket()
        const leaderId = ServiceLocator.leaderDAO.getLeaderId()
        const { host: leaderAddress, port: leaderPort } = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.CHATROOM_SERVER, roomid })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.serverid)
            });

            socket.on('error', (error) => {
                ElectionService.startElection().then(() => {
                    resolve(CommunicationService.getChatroomRegisteredServer(roomid))
                })
                .catch(err => {
                    console.log('error', err.message)
                })
            });

            socket.end();
        })
    }

    static informChatroomDeletion(roomid: string): Promise<boolean> {
        // check if the server is the leader before connecting
        // inform other servers about chatroom deletion
        console.log('INFORM CHATROOM DELETION');
        const socket = new Socket()
        const leaderId = ServiceLocator.leaderDAO.getLeaderId()
        const { host: leaderAddress, port: leaderPort } = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.INFORM_ROOMDELETION, roomid, serverid: getServerId() })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.acknowledged)
            });

            socket.on('error', (error) => {
                ElectionService.startElection().then(() => {
                    resolve(CommunicationService.informChatroomDeletion(roomid))
                })
                .catch(err => {
                    console.log('error', err.message)
                })
            });

            socket.end();
        })
    }

    static informClientDeletion(identity: string): Promise<boolean> {
        // check if the server is the leader before connecting
        // inform other servers about client deletion
        const socket = new Socket()
        const leaderId = ServiceLocator.leaderDAO.getLeaderId()
        const { host: leaderAddress, port: leaderPort } = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.INFORM_CLIENTDELETION, identity, serverid: getServerId() })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.acknowledged)
            });

            socket.on('error', (error) => {
                ElectionService.startElection().then(() => {
                    resolve(CommunicationService.informClientDeletion(identity))
                })
                .catch(err => {
                    console.log('error', err.message)
                })
            });
            socket.end();
        })
    }

    static saveNewIdentity(data: any) {
        const { identity, serverid } = data
        ServiceLocator.foreignClientsDAO.addNewClient(serverid, identity)
    }

    static saveNewChatRoom(data: any) {
        const { roomid, serverid } = data
        ServiceLocator.foreignChatroomsDAO.addNewChatroom(serverid, roomid)
    }

    static deleteRoom(data: any) {
        const { roomid, serverid } = data
        ServiceLocator.foreignChatroomsDAO.removeChatroom(serverid, roomid)
    }

    static deleteClient(data: any) {
        const { identity, serverid } = data
        ServiceLocator.foreignClientsDAO.removeClient(serverid, identity)
    }

}
