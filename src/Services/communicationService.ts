import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { LeaderService } from "./leaderService";
import { ElectionService } from "./electionService";

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

    static requestLeaderId() {
        console.log('REQUEST LEADER ID')
        const serverList = new ServerList()
        //add all requests to promisesList
        const promisesList: Array<Promise<any>> = [];

        serverList.getServerIds().filter(serverid => parseInt(serverid) != parseInt(getServerId())).forEach((serverid: string) => {
            const { serverAddress: host, coordinationPort: port } = serverList.getServer(serverid);
            const socket = new Socket()
            socket.connect(port, host)
            socket.setTimeout(10000);
            writeJSONtoSocket(socket, { type: responseTypes.REQUEST_LEADER_ID })
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
            //remove duplicates
            let uniq = [...new Set(responses.map(response => response.leaderid))];

            //only one id
            if (uniq.length === 1) {
                if (uniq[0] === "") {
                    //    start election
                    ElectionService.startElection()
                } else if (uniq[0] !== "") {
                    const leaderid = (uniq[0])
                    if (parseInt(leaderid) > parseInt(getServerId())) {
                        //    start election and request data
                        ElectionService.startElection().then(() => {
                            this.requestDataFromLeader(leaderid)
                        })
                    } else {
                        //    set leader id
                        //    request data
                        if (parseInt(leaderid) != parseInt(getServerId())) {
                            ServiceLocator.serversDAO.setLeaderId(leaderid)
                            this.requestDataFromLeader(leaderid)
                        }
                    }
                }
            } else if (uniq.length === 2 && (uniq[0] === '' || uniq[1] === '')) {
                const leaderid = uniq[0] === '' ? uniq[1] : uniq[0]
                if (parseInt(leaderid) != parseInt(getServerId())) {
                    ServiceLocator.serversDAO.setLeaderId(leaderid)
                    this.requestDataFromLeader(leaderid)
                }
                // ServiceLocator.serversDAO.setLeaderId(leaderid)
            }
            else {
                //multiple values
                console.log('multiple values from list- current leader id', ServiceLocator.serversDAO.getLeaderId());
            }

            // //// @Evindu /////
            // const maxId = Math.max(...uniq); // ??
            // if (parseInt(getServerId(), 10) > maxId) {
            //     ElectionService.startElection().then(() => {
            //         this.requestDataFromLeader(maxId.toString())
            //     })
            // } else {
            //     ServiceLocator.serversDAO.setLeaderId(maxId.toString())
            //     this.requestDataFromLeader(maxId.toString())
            // }
            /////////////////

            let latestClock = {clock : -1, leaderid: -1, clients: {}, chatrooms: {}};

            for (const res of responses) {
                if ((res.clock === latestClock.clock && res.leaderid > latestClock.leaderid) || res.clock > latestClock.clock) {
                    latestClock = res;
                }
            }

            if (latestClock.clock > 0) {
                // TODO : save clock
                ServiceLocator.serversDAO.setLeaderId(latestClock.leaderid.toString());
                ServiceLocator.foreignClientsDAO.saveClients(latestClock.clients);
                ServiceLocator.foreignChatroomsDAO.saveChatrooms(latestClock.chatrooms);
            }

        });
    }

    static informLeaderId(data: any, sock: Socket) {
        writeJSONtoSocket(sock, {
            type: responseTypes.REQUEST_LEADER_ID,
            leaderid: ServiceLocator.serversDAO.getLeaderId(),
            clock: ServiceLocator.serversDAO.getClock(),
            clients: ServiceLocator.foreignClientsDAO.getClients(),
            chatrooms: ServiceLocator.foreignChatroomsDAO.getChatrooms()
        })
    }

    static requestDataFromLeader(leaderid: string) {
        console.log('requestDataFromLeader id', leaderid)
        const socket = new Socket()
        const { serverAddress: leaderAddress, coordinationPort: leaderPort } = new ServerList().getServer(leaderid);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: responseTypes.REQUEST_DATA })

        socket.on('data', (buffer) => {
            const data = readJSONfromBuffer(buffer);
            ServiceLocator.foreignClientsDAO.saveClients(data.data.clients)
            ServiceLocator.foreignChatroomsDAO.saveChatrooms(data.data.chatrooms)
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
