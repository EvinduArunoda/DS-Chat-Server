// const express = require('express');
// import {test} from './utils';
//
// const app = express();
//
// const port = process.env.PORT || 4042 ;
//
// app.get('/', (_:any,res:any) => {
//     res.send('Your Express App');
// });
//
//
// app.listen(port, () => {
//     test();
//     console.log(`Server is running on port: ${port}`)
// });

// https://helloacm.com
// 09-Feb-2013

import {Socket} from "net";

var sys = require('sys');
var net = require('net');

var sockets : Socket[] = [];

var svr = net.createServer(function(sock: Socket) {
    sys.puts('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    sock.write('Hello ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
    sockets.push(sock);

    sock.on('data', function(data : any) {  // client writes message
        if (data == 'exit') {
            sys.puts('exit command received: ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
            sock.destroy();
            var idx = sockets.indexOf(sock);
            if (idx != -1) {
                delete sockets[idx];
            }
            return;
        }
        var len = sockets.length;
        for (var i = 0; i < len; i ++) { // broad cast
            if (sockets[i] != sock) {
                if (sockets[i]) {
                    sockets[i].write(sock.remoteAddress + ':' + sock.remotePort + ':' + data);
                }
            }
        }
    });

    sock.on('end', function(data : any) { // client disconnects
        sys.puts('Disconnected: ' + data + data.remoteAddress + ':' + data.remotePort + '\n');
        var idx = sockets.indexOf(sock);
        if (idx != -1) {
            delete sockets[idx];
        }
    });
});

var svraddr = '127.0.0.1';
var svrport = 8080;

svr.listen(svrport, svraddr);
console.log('Server Created at ' + svraddr + ':' + svrport + '\n');