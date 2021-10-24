import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { LeaderService } from "./leaderService";
import { ElectionService } from "./electionService";
import { ClientsObject } from "../Interfaces/ForeignClientInterface";
import { ChatroomsObject } from "../Interfaces/ForeignChatroomInterface";

export class CommunicationService {
    constructor() { }

    static async isClientRegistered(identity: string): Promise<boolean> {
        // Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'isclient', identity: identity, serverid: serverid }
        const leaderid = ServiceLocator.serversDAO.getLeaderId()
        const serverid = getServerId()
        // check if the server is the leader before connecting
        if (leaderid === serverid) {
            return new Promise((resolve, reject) => {
                // Check database
                if (ServiceLocator.foreignClientsDAO.isRegistered(identity)) {
                    resolve(true);
                } else {
                    ServiceLocator.foreignClientsDAO.addNewClient(serverid, identity)
                    // Inform other servers
                    LeaderService.broadcastServers({ type: responseTypes.BROADCAST_NEWIDENTITY, approved: true, identity, serverid })
                    resolve(false);
                }
            })
        } else {
            const socket = new Socket()
            const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
            socket.connect(leaderPort, leaderAddress)
            writeJSONtoSocket(socket, { type: responseTypes.IS_CLIENT, identity, serverid })
            // TODO: what if there is no leader
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
                        resolve(CommunicationService.isClientRegistered(identity))
                    })
                        .catch(err => {
                            console.log('error', err.message)
                        })
                });

                socket.end();
            })
        }
    }



    static isChatroomRegistered(roomid: string): Promise<boolean> {
        // check if the server is the leader before connecting
        // Check if room id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'ischatroom', roomid: roomid, serverid: serverid}
        const leaderid = ServiceLocator.serversDAO.getLeaderId()
        const serverid = getServerId()
        // check if the server is the leader before connecting
        if (leaderid === serverid) {
            return new Promise((resolve, reject) => {
                if (ServiceLocator.foreignChatroomsDAO.isRegistered(roomid)) {
                    resolve(true);
                } else {
                    ServiceLocator.foreignChatroomsDAO.addNewChatroom(serverid, roomid)
                    // Inform other servers
                    LeaderService.broadcastServers({ type: responseTypes.BROADCAST_CREATEROOM, approved: true, roomid, serverid })
                    resolve(false);
                }
            })
        } else {
            const socket = new Socket()
            const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
            socket.connect(leaderPort, leaderAddress)
            writeJSONtoSocket(socket, { type: responseTypes.IS_CHATROOM, roomid, serverid })
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
    }

    static getChatroomRegisteredServer(roomid: string): Promise<string | undefined> {
        // check if the server is the leader before connecting
        // check if the room is in another server
        // return server id
        // return undefined if not found
        // {type:'chatroomserver', roomid:roomid}
        const leaderid = ServiceLocator.serversDAO.getLeaderId()
        const serverid = getServerId()
        // check if the server is the leader before connecting
        if (leaderid === serverid) {
            return new Promise((resolve, reject) => {
                resolve(ServiceLocator.foreignChatroomsDAO.getChatroomServer(roomid))
            })
        } else {
            const socket = new Socket()
            const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
            socket.connect(leaderPort, leaderAddress)
            writeJSONtoSocket(socket, { type: responseTypes.CHATROOM_SERVER, roomid })
            return new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    resolve(data.serverid)
                });
                socket.end();
            })
        }
    }

    static informChatroomDeletion(roomid: string): Promise<any> {
        // inform other servers about chatroom deletion
        const leaderid = ServiceLocator.serversDAO.getLeaderId()
        const serverid = getServerId()
        // check if the server is the leader before connecting
        if (leaderid === serverid) {
            return new Promise((resolve, reject) => {
                ServiceLocator.foreignChatroomsDAO.removeChatroom(serverid, roomid);
                // inform other servers
                LeaderService.broadcastServers({ type: responseTypes.BROADCAST_DELETEROOM, roomid, serverid })
                resolve(true)
            })
        } else {
            const socket = new Socket()
            const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
            socket.connect(leaderPort, leaderAddress)
            writeJSONtoSocket(socket, { type: responseTypes.INFORM_ROOMDELETION, roomid, serverid })
            return new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    resolve(data.acknowledged)
                });
                // TODO: should work without deletion
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
    }

    static informClientDeletion(identity: string): Promise<any> {
        // check if the server is the leader before connecting
        // inform other servers about client deletion
        const leaderid = ServiceLocator.serversDAO.getLeaderId()
        const serverid = getServerId()
        // check if the server is the leader before connecting
        if (leaderid === serverid) {
            return new Promise((resolve, reject) => {
                ServiceLocator.foreignClientsDAO.removeClient(serverid, identity);
                // inform other servers
                LeaderService.broadcastServers({ type: responseTypes.BROADCAST_QUIT, identity, serverid })
                resolve(true)
            })
        } else {
            const socket = new Socket()
            const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
            socket.connect(leaderPort, leaderAddress)
            writeJSONtoSocket(socket, { type: responseTypes.INFORM_CLIENTDELETION, identity, serverid })
            return new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    resolve(data.acknowledged)
                });
                // TODO: should work without deletion
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
    }

    static updateDatabase(data: { clock: number, leaderid: string, clients: ClientsObject, chatrooms: ChatroomsObject}) {
        ServiceLocator.serversDAO.updateClock(data.clock);
        ServiceLocator.serversDAO.setLeaderId(data.leaderid);
        ServiceLocator.foreignClientsDAO.saveClients(data.clients);
        ServiceLocator.foreignChatroomsDAO.saveChatrooms(data.chatrooms);
    }

    static requestInitialData() {
        console.log('REQUEST DATA')
        const serverList = new ServerList()
        //add all requests to promisesList
        const promisesList: Array<Promise<any>> = [];

        serverList.getServerIds().filter(serverid => parseInt(serverid) != parseInt(getServerId())).forEach((serverid: string) => {
            const { serverAddress: host, coordinationPort: port } = serverList.getServer(serverid);
            const socket = new Socket()
            socket.connect(port, host)
            socket.setTimeout(10000);
            writeJSONtoSocket(socket, { type: responseTypes.REQUEST_DATA })
            const promise = new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    const { leaderid, clock, clients, chatrooms } = data
                    resolve({ leaderid, clock, clients, chatrooms })
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

        Promise.all(promisesList).then((values) => {
            const responses = values.filter(value => value !== null)

            let latestData = {
                leaderid: ServiceLocator.serversDAO.getLeaderId(),
                clock: ServiceLocator.serversDAO.getClock(),
                clients: ServiceLocator.foreignClientsDAO.getClients(),
                chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
            }
            let updated = false

            for (const res of responses) {
                // get the highest leader id with letest clock
                if ((res.clock === latestData.clock && res.leaderid > latestData.leaderid) || res.clock > latestData.clock) {
                    latestData = res;
                    updated = true
                }
            }

            // update database
            if (updated) {
                this.updateDatabase(latestData)
            }

            // call election if current leader has lower id
            if (parseInt(latestData.leaderid) < parseInt(getServerId())) {
                ElectionService.startElection().then(() => {
                    // leader might have updated before election starts
                    this.requestDataFromLeader(latestData.leaderid)
                })
            }

        });
    }

    static requestDataFromLeader(leaderid: string) {
        console.log('requestDataFromLeader id', leaderid)
        const socket = new Socket()
        const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.REQUEST_DATA })

        socket.on('data', (buffer) => {
            const data = readJSONfromBuffer(buffer);
            this.updateDatabase(data)
        });

        socket.on('error', (err) => {
            console.log('error:', err.message)
            socket.end()
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

    static deleteIdentity(data: any) {
        const { identity, serverid } = data
        ServiceLocator.foreignClientsDAO.removeClient(serverid, identity)
    }

    static deleteChatRoom(data: any) {
        const { roomid, serverid } = data
        ServiceLocator.foreignChatroomsDAO.removeChatroom(serverid, roomid)
    }
}
