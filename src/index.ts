import net, { Socket } from "net";
import { readJSONfromBuffer } from "./Utils/utils";
import { responseTypes } from "./Constants/responseTypes";
import { ServiceLocator } from "./Utils/serviceLocator";
import { LeaderService } from "./Services/leaderService"
import { ElectionService } from "./Services/electionService";
// server id
if (!process.env.SERVER_ID) {
    process.env['SERVER_ID'] = '1';
}
if (!ServiceLocator.leaderDAO.getLeaderId()) {
    ElectionService.startElection()
    // ServiceLocator.leaderDAO.setLeaderId('1')
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
            //election
            case "startelection":
                return ServiceLocator.electionHandler.approveElection(data, sock)
            case "declareleader":
                return ServiceLocator.electionHandler.setElectedLeader(data)
            // leader functions
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
            // node functions
            case responseTypes.BROADCAST_NEWIDENTITY:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastNewIdentity(data)
            case responseTypes.BROADCAST_CREATEROOM:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastCreateroom(data)
            case responseTypes.BROADCAST_DELETEROOM:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastDeleteroom(data)
            case responseTypes.BROADCAST_QUIT:
                return ServiceLocator.mainHandler.getCommunicationHandler().broadcastQuit(data)
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
