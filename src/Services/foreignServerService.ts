import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";

export class ForeignServerService {
    constructor() { }

    static async isClientRegistered(identity: string): Promise<any> {
        // TODO: Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'isclient', identity: identity }
        const socket = new Socket()
        const leaderPort = 4444
        const leaderAddress = 'localhost'
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'isclient', identity })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                if (data.exists) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            });
            socket.end();
        })
    }

    static isChatroomRegistered(roomid: string): Promise<boolean> {
        // TODO: Check if room id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'ischatroom', roomid: roomid}
        const socket = new Socket()
        const leaderId = ServiceLocator.database.leaderId
        const {host : leaderAddress, port : leaderPort} = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'ischatroom', roomid })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                if (data.exists) {
                    resolve(true)
                }
                else {
                    resolve(false)
                }
            });
            socket.end();
        })
    }

    static getChatroomRegisteredServer(roomid: string): Promise<string | undefined> {
        // TODO: check if the room is in another server
        // return server id
        // return undefined if not found
        // {type:'chatroomserver', roomid:roomid}
        const socket = new Socket()
        const leaderId = ServiceLocator.database.leaderId
        const {host : leaderAddress, port : leaderPort} = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'chatroomserver', roomid })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.serverid)
            });
            socket.end();
        })
    }

    static informChatroomDeletion(roomid: string): Promise<boolean> {
        // TODO: inform other servers about chatroom deletion
        const socket = new Socket()
        const leaderId = ServiceLocator.database.leaderId
        const {host : leaderAddress, port : leaderPort} = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'informroomdeletion', roomid })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.acknowledged)
            });
            socket.end();
        })
    }

    static informClientDeletion(identity: string): Promise<boolean> {
        // TODO: inform other servers about client deletion
        const socket = new Socket()
        const leaderId = ServiceLocator.database.leaderId
        const {host : leaderAddress, port : leaderPort} = new ServerList().getServer(leaderId);
        socket.connect(leaderPort, leaderAddress)
        writeJSONtoSocket(socket, { type: 'informclientdeletion', identity })
        return new Promise((resolve, reject) => {
            socket.on('data', (buffer) => {
                const data = readJSONfromBuffer(buffer);
                resolve(data.acknowledged)
            });
            socket.end();
        })
    }
}
