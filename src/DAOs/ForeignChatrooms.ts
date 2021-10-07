import _ from "lodash";
import { serverList } from "../Constants/serverList";
import { ForeignChatroomInterface } from "../Interfaces/ForeignChatroomInterface";

export class ForeignChatroomsDAO {
    private chatrooms: ForeignChatroomInterface = {};

    constructor() {
        _.keys(serverList).forEach((serverName: string) => {
            this.chatrooms[serverName] = new Set<string>()
        })
    }

    /**
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        const roomIds = _.flatten(_.map(_.values(this.chatrooms), (set) => Array.from(set)));
        console.log("ForeignChatroomsDAO.getRoomIds", roomIds);
        return roomIds;
    }

    // called by the leader node

    /**
     * add new chatroom
     * @param roomid chatroom id
     * @param serverId server id
     */
    addNewChatroom(serverID: string, roomid: string): void {
        this.chatrooms[serverID].add(roomid);
        console.log("ForeignChatroomsDAO.addNewChatroom", serverID, roomid);
    }

    /**
     * remove chatroom
     * @param roomid chatroom id
     * @param serverId server id
     */
    removeChatroom(serverID: string, roomid: string): void {
        this.chatrooms[serverID].delete(roomid)
        console.log("ForeignChatroomsDAO.deleteChatroom", serverID, roomid);
    }

}