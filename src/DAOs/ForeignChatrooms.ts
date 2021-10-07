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
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        const roomids = _.flatten(_.map(_.values(this.chatrooms), (set) => Array.from(set)));
        console.log("ForeignChatroomsDAO.getRoomIds", roomids);
        return roomids;
    }

    // called by the leader node

    /**
     * add new chatroom
     * @param roomid chatroom id
     * @param serverid server id
     */
    addNewChatroom(serverid: string, roomid: string): void {
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