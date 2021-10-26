import net, { Socket } from "net";
import { getServerId, readJSONfromBuffer } from "./Utils/utils";
import { responseTypes } from "./Constants/responseTypes";
import { ServiceLocator } from "./Utils/serviceLocator";
import { ServerList } from "./Constants/servers";
import { CommunicationService } from "./Services/communicationService";
import { LeaderService } from "./Services/leaderService";
const cron = require('node-cron');

// server id
if (!process.env.SERVER_ID) {
    process.env['SERVER_ID'] = '1';
}

const { serverAddress, coordinationPort, clientsPort } = new ServerList().getServer(getServerId().toString());

// Get initial data from other nodes
CommunicationService.requestInitialData()

// server for cleints
const server = net.createServer();

server.on('connection', (sock: Socket) => {
    console.log('Connected to client: ' + sock.remoteAddress + ':' + sock.remotePort);

    // recive messages from client
    sock.on('data', async function (buffer: Buffer) {
        const data = readJSONfromBuffer(buffer);
        console.log(data)

        switch (data.type) {
            case responseTypes.NEW_IDENTITY:
                return await ServiceLocator.mainHandler.getClientHandler().newIdentity(data, sock);
            case responseTypes.LIST:
                return ServiceLocator.mainHandler.getChatroomHandler().list(sock);
            case responseTypes.WHO:
                return ServiceLocator.mainHandler.getChatroomHandler().who(sock);
            case responseTypes.CREATE_ROOM:
                return ServiceLocator.mainHandler.getChatroomHandler().createRoom(data, sock);
            case responseTypes.JOIN_ROOM:
                return ServiceLocator.mainHandler.getChatroomHandler().joinRoom(data, sock);
            case responseTypes.MOVE_JOIN:
                return ServiceLocator.mainHandler.getChatroomHandler().moveJoin(data, sock);
            case responseTypes.DELETE_ROOM:
                return ServiceLocator.mainHandler.getChatroomHandler().deleteRoom(data, sock);
            case responseTypes.MESSAGE:
                return ServiceLocator.mainHandler.getChatroomHandler().message(data, sock);
            case responseTypes.QUIT:
                return ServiceLocator.mainHandler.getClientHandler().disconnect(sock, false);
            default:
                break;
        }
    });

    // error occurs
    sock.on('error', function (data: any) {
        console.log('error', data)
    })

    // client closes with or without error
    sock.on('close', function (isError: boolean) {
        if (isError) {
            ServiceLocator.mainHandler.getClientHandler().disconnect(sock, true);
        }
    });
});



server.listen(clientsPort, serverAddress, () => {
    console.log(`Client server port opened at ${serverAddress}:${clientsPort}\n`);
});

// communications among chat servers

const coordinationServer = net.createServer();

coordinationServer.on('connection', (sock: Socket) => {
    console.log('Connected to server: ' + sock.remoteAddress + ':' + sock.remotePort);

    // recive messages from server
    sock.on('data', async function (buffer: Buffer) {
        const data = readJSONfromBuffer(buffer);
        console.log(data)

        switch (data.type) {
            // election
            case responseTypes.START_ELECTION:
                return ServiceLocator.electionHandler.approveElection(data, sock)
            case responseTypes.DECLARE_LEADER:
                return ServiceLocator.electionHandler.setElectedLeader(data)
            // recieved by leader
            case responseTypes.IS_CLIENT:
                return ServiceLocator.mainHandler.getLeaderHandler().isClient(data, sock)
            case responseTypes.IS_CHATROOM:
                return ServiceLocator.mainHandler.getLeaderHandler().isChatroom(data, sock)
            case responseTypes.CHATROOM_SERVER:
                return ServiceLocator.mainHandler.getLeaderHandler().chatroomServer(data, sock)
            case responseTypes.INFORM_ROOMDELETION:
                return ServiceLocator.mainHandler.getLeaderHandler().informRoomDeletion(data, sock)
            case responseTypes.INFORM_CLIENTDELETION:
                return ServiceLocator.mainHandler.getLeaderHandler().informClientDeletion(data, sock)
            // recieved by other nodes
            case responseTypes.REQUEST_DATA:
                return ServiceLocator.mainHandler.getLeaderHandler().provideLeaderState(sock)
            case responseTypes.BROADCAST_SERVER_UPDATE:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastServerUpdate(data)
            case responseTypes.HEARTBEAT:
                return ServiceLocator.mainHandler.getCommunicationHandler().respondHeartBeat(data, sock)
            default:
                break;
        }
    });

    // error occurs
    sock.on('error', function (data: any) {
        console.log('error', data)
    })

    // client closes with or without error
    sock.on('close', function (isError: boolean) {
        console.log('connection closed')
    });
});


coordinationServer.listen(coordinationPort, serverAddress, () => {
    console.log(`Coordination server port opened at ${serverAddress}:${coordinationPort}\n`);
});

setTimeout(() => {
    cron.schedule('*/10 * * * * *', () => {
        if(getServerId() === ServiceLocator.serversDAO.getLeaderId()) {
            LeaderService.hasMajority()
        }
    });
}, 10000); // Wait for 10 seconds at begin