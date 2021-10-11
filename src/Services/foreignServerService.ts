import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";

export class ForeignServerService {
    constructor() { }

    static async isClientRegistered(identity: string): Promise<any> {
        // TODO: Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        // {type: 'isclient', identity: identity }
        try{
            const result = await apiFunctionWrapper(identity);
            console.log('RESPONSE',result)
            return result
        }catch (e) {
            console.error("ERROR:" + e);
            return e
        }
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

// let's say this is the API function with two callbacks,
// one for success and the other for error
function apiFunction(identity:string, successCallback:any, errorCallback:any) {
    const socket = new Socket()
    const leaderPort = 4444
    const leaderAddress = 'localhost'
    socket.connect(leaderPort, leaderAddress)
    writeJSONtoSocket(socket, { type: 'isclient', identity })
    socket.on('data', (buffer) => {
        const data =  readJSONfromBuffer(buffer);
        console.log('USER EXISTS:  ',data)
        if (data.exists) {
            console.log('DATA EXISTS')
            successCallback(true)
        }
        else {
            console.log('DATA DOESNOT EXISTS')
            errorCallback(false)
        }
    })

}

// myFunction wraps the above API call into a Promise
// and handles the callbacks with resolve and reject
function apiFunctionWrapper(identity:string) {
    return new Promise((resolve, reject) => {
        apiFunction(identity,(successResponse: any) => {
            resolve(successResponse);
        }, (errorResponse:any) => {
            reject(errorResponse);
        });
    });
}



