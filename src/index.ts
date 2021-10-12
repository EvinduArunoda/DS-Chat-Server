import net, { Socket } from "net";
import { readJSONfromBuffer } from "./Utils/utils";
import { responseTypes } from "./Constants/responseTypes";
import { ServiceLocator } from "./Utils/serviceLocator";
import { checkChatroomExists, checkClientExists, getChatroomServer } from "./Services/communicationService"
// server id
if (!process.env.SERVER_ID) {
    process.env['SERVER_ID'] = 's1';
}
if (!ServiceLocator.database.leaderId) {
    ServiceLocator.database.leaderId = 's1'
}
const server = net.createServer();

server.on('connection', (sock: Socket) => {
    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    // sockets.push(sock);

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
            case 'isclient':
                return checkClientExists(data, sock)
            case 'ischatroom':
                return checkChatroomExists(data, sock)
            case 'chatroomserver':
                return getChatroomServer(data, sock)

            case 'broadcastnewidentity':
                return getChatroomServer(data, sock)
            case 'broadcastcreateroom':
                return getChatroomServer(data, sock)
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

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '4444');

server.listen(PORT, HOST, () => {
    console.log(`Server Created at ${HOST}:${PORT}\n`);
});
