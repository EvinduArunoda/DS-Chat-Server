import net, {Socket} from "net";
import {readJSONfromBuffer, writeJSONtoSocket} from "./utils";

var sockets : Socket[] = [];

const server = net.createServer();

server.on('connection', (sock: Socket) => {
    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    // sockets.push(sock);

    // recive messages from client
    sock.on('data', function(buffer: Buffer) {
        const data = readJSONfromBuffer(buffer);

        switch (data.type) {
            case "newidentity":
                writeJSONtoSocket(sock, {type: "newidentity", approved: "false"})
                break;
            default:
                break;
        }

        console.log(data.type)
        // if (data == 'exit') {
        //     console.log('exit command received: ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
            // sock.destroy();
        //     var idx = sockets.indexOf(sock);
        //     if (idx != -1) {
        //         delete sockets[idx];
        //     }
        //     return;
        // }
        // var len = sockets.length;
        // for (var i = 0; i < len; i ++) { // broad cast
        //     if (sockets[i] != sock) {
        //         if (sockets[i]) {
        //             sockets[i].write(sock.remoteAddress + ':' + sock.remotePort + ':' + data);
        //         }
        //     }
        // }
    });

    sock.on('end', function(data : any) { // client disconnects
        console.log('Disconnected: ' + data + data.remoteAddress + ':' + data.remotePort + '\n');
        // var idx = sockets.indexOf(sock);
        // if (idx != -1) {
        //     delete sockets[idx];
        // }
    });
});

const HOST = '127.0.0.1';
const PORT = 8080;

server.listen(PORT, HOST, () => {
    console.log(`Server Created at ${HOST}:${PORT}\n`);
});