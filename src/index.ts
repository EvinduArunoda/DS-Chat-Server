import net, { Socket } from "net";
import { readJSONfromBuffer } from "./Utils/utils";
import { ClientHandler } from "./Handlers/clientHandler";
import { ChatroomHandler } from "./Handlers/chatroomHandler";
import { responseTypes } from "./Constants/responseTypes";

// server id
process.env['SERVER_ID'] = '1';

const server = net.createServer();

server.on('connection', (sock: Socket) => {
    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    // sockets.push(sock);

    // recive messages from client
    sock.on('data', function (buffer: Buffer) {
        const data = readJSONfromBuffer(buffer);
        console.log(data)

        switch (data.type) {
            case responseTypes.NEW_IDENTITY:
                return ClientHandler.newIdentity(data, sock);
            case responseTypes.LIST:
                return ChatroomHandler.list(sock);
            case responseTypes.WHO:
                return ChatroomHandler.who(sock);
            case responseTypes.CREATE_ROOM:
                return ChatroomHandler.createRoom(data, sock);
            case responseTypes.JOIN_ROOM:
                return ChatroomHandler.joinRoom(data, sock);
            case responseTypes.MOVE_JOIN:
                return ChatroomHandler.moveJoin(data, sock);
            case responseTypes.DELETE_ROOM:
                return ChatroomHandler.deleteRoom(data, sock);
            case responseTypes.MESSAGE:
                return ChatroomHandler.message(data, sock);
            case responseTypes.QUIT:
                return ClientHandler.disconnect(sock);
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
            ClientHandler.disconnect(sock);
        }
    });
});

const HOST = '127.0.0.1';
const PORT = 8080;

server.listen(PORT, HOST, () => {
    console.log(`Server Created at ${HOST}:${PORT}\n`);
});