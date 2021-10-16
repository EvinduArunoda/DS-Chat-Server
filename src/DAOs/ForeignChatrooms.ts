import _ from "lodash";
import { ServerList } from "../Constants/servers";
import { ForeignChatroomInterface } from "../Interfaces/ForeignChatroomInterface";

export class ForeignChatroomsDAO {
    private chatrooms: ForeignChatroomInterface = {};

    constructor() {
        new ServerList().getServerIds().forEach((serverName: string) => {
            this.chatrooms[serverName] = new Set<string>()
        })
    }

    /**
     * check if the roomid is unique
     * @param roomid client id
     * @returns boolean
     */
    isRegistered(roomid: string): boolean {
        // check if the clients Map<string, Set<string>> has roomid
        var isRegistered = _.findKey(this.chatrooms, (server) => server.has(roomid)) !== undefined
        console.log("ForeignChatroomsDAO.isRegistered", roomid, isRegistered);
        return isRegistered;
    }

    /**
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        const roomids = _.flatten(_.map(_.values(this.chatrooms), (set) => Array.from(set)));
        console.log("ForeignChatroomsDAO.getRoomIds", roomids);
        return roomids;
    }

    /**
     * get the serverid of the chatroom
     * @param roomid client id
     * @returns serverid
     */
    getChatroomServer(roomid: string): string | undefined {
        // check if the clients Map<string, Set<string>> has roomid and return serverdi
        return _.findKey(this.chatrooms, (server) => server.has(roomid))
    }

    /**
     * add new chatroom
     * @param roomid chatroom id
     * @param serverid server id
     */
    addNewChatroom(serverid: string, roomid: string): void {
        if(this.chatrooms[serverid] === undefined){
            this.chatrooms[serverid] = new Set()
        }
        this.chatrooms[serverid].add(roomid);
        console.log("ForeignChatroomsDAO.addNewChatroom", serverid, roomid);
    }

    /**
     * remove chatroom
     * @param roomid chatroom id
     * @param serverid server id
     */
    removeChatroom(serverid: string, roomid: string): void {
        this.chatrooms[serverid].delete(roomid)
        console.log("ForeignChatroomsDAO.deleteChatroom", serverid, roomid);
    }

}