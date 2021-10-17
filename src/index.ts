import net, { Socket } from "net";
import { getServerId, readJSONfromBuffer } from "./Utils/utils";
import { responseTypes } from "./Constants/responseTypes";
import { ServiceLocator } from "./Utils/serviceLocator";
import { ServerList } from "./Constants/servers";


const { serverAddress, coordinationPort, clientsPort } = new ServerList().getServer(getServerId());

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
            // recieved by oter nodes
            case responseTypes.BROADCAST_NEWIDENTITY:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastNewIdentity(data)
            case responseTypes.BROADCAST_CREATEROOM:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastCreateroom(data)
            case responseTypes.BROADCAST_DELETEIDENTITY:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastDeleteIdentity(data)
            case responseTypes.BROADCAST_DELETEROOM:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastDeleteroom(data)
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