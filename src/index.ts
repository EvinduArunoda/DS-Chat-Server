import net, { Socket } from "net";
import { readJSONfromBuffer } from "./Utils/utils";
import { ClientHandler } from "./Handlers/clientHandler";
import { ChatroomHandler } from "./Handlers/chatroomHandeler";

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
            case "newidentity":
                return ClientHandler.newIdentity(data, sock);
            case "list":
                return ChatroomHandler.listChatrooms(sock);
            case "who":
                return ChatroomHandler.listParticipants(sock);
            case "createroom":
                // TODO: create room
                return;
            case "joinroom":
                // TODO: join room
                return;
            case "deleteroom":
                // TODO: delete room
                return;
            case "message":
                // TODO: create room
                return;
            case "quit":
                // TODO: disconnect
                return;
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
        ClientHandler.disconnect(sock);
    });
});

const HOST = '127.0.0.1';
const PORT = 8080;

server.listen(PORT, HOST, () => {
    console.log(`Server Created at ${HOST}:${PORT}\n`);
});