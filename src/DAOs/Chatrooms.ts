import _ from "lodash";
import { ChatroomInterface, LocalChatroom } from "../Interfaces/ChatroomInterface";
import { getMainHallId } from "../Utils/utils";

export class ChatroomDAO {
    private chatrooms: ChatroomInterface = {};

    constructor() {
        this.chatrooms[getMainHallId()] = {
            owner: undefined,
            participants: new Set<string>(),
        };
    }

    /**
     * check if the roomid is unique in local server
     * @param roomid client id
     * @returns boolean
     */
    isRegistered(roomid: string): boolean {
        const isRegistered = _.has(this.chatrooms, roomid)
        console.log("ChatroomDAO.isRegistered", roomid, isRegistered);
        return isRegistered;
    }

    isOwner(identity: string, roomid: string): boolean {
        const isOwner = this.chatrooms[roomid]?.owner === identity;
        console.log("ChatroomDAO.isOwner", identity, roomid, isOwner);
        return isOwner;
    }

    /**
     * add new chatroom
     * @param previousRoomId roomid of previous group
     * @param newRoomId roomid of new group
     * @param identity identity
     */
    addNewChatroom(previousRoomId: string, newRoomId: string, identity: string): void {
        // remove from previous chatroom
        this.removeParticipant(previousRoomId, identity);
        this.chatrooms[newRoomId] = {
            owner: identity,
            participants: new Set<string>().add(identity),
        };
        console.log("ChatroomDAO.addNewChatroom", identity, "from", previousRoomId, "to", newRoomId);
    }

    /**
     * delete chstroom from roomid
     * @param roomid roomid
     */
    deleteChatroom(roomid: string): void {
        console.log("ChatroomDAO.deleteChatroom", roomid);
        delete this.chatrooms[roomid];
    }

    /**
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        const roomids = _.keys(this.chatrooms);
        console.log("ChatroomDAO.getRoomIds", roomids);
        return roomids;
    }

    /**
     * get chatroom from roomid
     * @param roomid roomid
     * @returns chatroom
     */
    getRoom(roomid: string): LocalChatroom {
        console.log("ChatroomDAO.getRoom", roomid);
        return this.chatrooms[roomid]
    }

    /**
     * add patiripant to Mainhall
     * @param participant identity
     */
    addParticipantDefault(participant: string): void {
        console.log("ChatroomDAO.addParticipantDefault", participant, "to", getMainHallId());
        this.chatrooms[getMainHallId()].participants.add(participant);
    }

    /**
     * add participant to chatroom
     * @param roomid roomid
     * @param participant identity 
     */
    addParticipant(roomid: string, participant: string): void {
        console.log("ChatroomDAO.addParticipant", participant, "to", roomid);
        this.chatrooms[roomid].participants.add(participant);
    }

    /**
     * remove a participant from chatroom
     * @param roomid roomid
     * @param participant identity
     */
    removeParticipant(roomid: string, participant: string): void {
        console.log("ChatroomDAO.removeParticipant", participant, "from", roomid);
        this.chatrooms[roomid].participants.delete(participant);
    }

    /**
     * get participant list from roomid
     * @param roomid roomid
     * @returns list of identities
     */
    getParticipants(roomid: string): string[] {
        const participants = Array.from(this.chatrooms[roomid].participants);
        console.log("ChatroomDAO.getParticipants", roomid, participants);
        return participants;
    }

    /**
     * get participant between chatrooms
     * @param roomid roomid
     * @param participant identity
     */
    changeChatroom(participant: string, previousRoomid: string, roomid: string): void {
        this.chatrooms[previousRoomid]?.participants.delete(participant);
        this.chatrooms[roomid].participants.add(participant);
    }
}