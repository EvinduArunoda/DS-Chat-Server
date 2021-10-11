import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";

export class ForeignServerService {
    constructor() { }

    static isClientRegistered(identity: string): boolean {
        // TODO: Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'isclient', identity: identity }
        const socket = new Socket()
        const leaderPort = 4444
        const leaderAddress = 'localhost'
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'isclient', identity })
        let exists:boolean;
        socket.on('data', (buffer) => {
            const data = readJSONfromBuffer(buffer);
            if (data.exists) {
                exists = true
            }
            else {
                exists = false
            }
        })
        socket.end();
    }

    static isChatroomRegistered(roomid: string): boolean {
        // TODO: Check if room id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'ischatroom', roomid: roomid}
        const socket = new Socket()
        const leaderPort = 4444
        const leaderAddress = 'localhost'
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'ischatroom', roomid })
        socket.on('data', (buffer) => {
            const data = readJSONfromBuffer(buffer);
            if (data.exists) {
                return true
            }
            else {
                return false
            }
        });
        socket.end();
        return true;
    }

    static getChatroomRegisteredServer(roomid: string): string | undefined {
        // TODO: check if the room is in another server
        // return server id
        // return undefined if not found
        // {type:'chatroomserver', roomid:roomid}
        return;
    }

    static informChatroomDeletion(roomid: string): void {
        // TODO: inform other servers about chatroom deletion
    }

    static informClientDeletion(identity: string): void {
        // TODO: inform other servers about client deletion
    }
}
