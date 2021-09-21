import net, {Socket} from "net";
import {readJSONfromBuffer} from "./Utils/utils";
import {ClientHandler} from "./Handlers/clientHandler";

// server id
process.env['SERVER_ID'] = '1';

const server = net.createServer();

server.on('connection', (sock: Socket) => {
    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    // sockets.push(sock);

    // recive messages from client
    sock.on('data', function(buffer: Buffer) {
        const data = readJSONfromBuffer(buffer);
        console.log(data)

        switch (data.type) {
            case "newidentity":
                new ClientHandler().newIdentity(data, sock);
                break;
            default:
                break;
        }
    });

    // error occurs
    sock.on('error', function (data: any) {
        console.log('error', data)
    })

    // client closes with or without error
    sock.on('close', function(isError: boolean) {
        new ClientHandler().disconnect(sock);
    });
});

const HOST = '127.0.0.1';
const PORT = 8080;

server.listen(PORT, HOST, () => {
    console.log(`Server Created at ${HOST}:${PORT}\n`);
});