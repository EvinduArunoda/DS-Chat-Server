import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { writeJSONtoSocket } from "../Utils/utils";

export class ForeignServerService {
    constructor() { }

    static isClientRegistered(identity: string): boolean {
        // TODO: Check if client id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        return true;
    }

    static isChatroomRegistered(roomid: string): boolean {
        // TODO: Check if room id is unique and inform other servers
        // return true if id is NOT unique
        // return false if id is unique
        return true;
    }

    static getChatroomRegisteredServer(roomid: string): string | undefined {
        // TODO: check if the room is in another server
        // return server id
        // return undefined if not found
        return;
    }

    static informChatroomDeletion(roomid: string): void {
        // TODO: inform other servers about chatroom deletion
    }

    static informClientDeletion(identity: string): void {
        // TODO: inform other servers about client deletion
    }
}
