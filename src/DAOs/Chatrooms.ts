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
     * @param roomId roomid
     */
    deleteChatroom(roomId: string): void {
        console.log("ChatroomDAO.deleteChatroom", roomId);
        delete this.chatrooms[roomId];
    }

    /**
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        const roomIds = _.keys(this.chatrooms);
        console.log("ChatroomDAO.getRoomIds", roomIds);
        return roomIds;
    }

    /**
     * get chatroom from roomid
     * @param roomId roomid
     * @returns chatroom
     */
    getRoom(roomId: string): LocalChatroom {
        console.log("ChatroomDAO.getRoom", roomId);
        return this.chatrooms[roomId]
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
     * @param roomId roomid
     * @param participant identity 
     */
    addParticipant(roomId: string, participant: string): void {
        console.log("ChatroomDAO.addParticipant", participant, "to", roomId);
        this.chatrooms[roomId].participants.add(participant);
    }

    /**
     * remove a participant from chatroom
     * @param roomId roomid
     * @param participant identity
     */
    removeParticipant(roomId: string, participant: string): void {
        console.log("ChatroomDAO.removeParticipant", participant, "from", roomId);
        this.chatrooms[roomId].participants.delete(participant);
    }

    /**
     * get participant list from roomid
     * @param roomId roomid
     * @returns list of identities
     */
    getParticipants(roomId: string): string[] {
        const participants = Array.from(this.chatrooms[roomId].participants);
        console.log("ChatroomDAO.getParticipants", roomId, participants);
        return participants;
    }

    /**
     * get participant between chatrooms
     * @param roomId roomid
     * @param participant identity
     */
    changeChatroom(participant: string, previousRoomid: string, roomId: string): void {
        this.chatrooms[previousRoomid].participants.delete(participant);
        this.chatrooms[roomId].participants.add(participant);
    }
}