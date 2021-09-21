import _ from "lodash";
import { ChatroomInterface, LocalChatroom } from "../Interfaces/ChatroomInterface";

export class ChatroomDAO {
    private chatrooms: ChatroomInterface = {};

    constructor() {
        this.chatrooms[`MainHall-s${process.env.SERVER_ID}`] = {
            owner: undefined,
            participants: new Set<string>(),
        };
    }

    /**
     * add new chatroom
     * @param roomId roomid
     * @param owner identity
     */
    addNewChatroom(roomId: string, owner: string): void {
        this.chatrooms[roomId] = {
            owner: owner,
            participants: new Set<string>(owner),
        };
    }

    /**
     * delete chstroom from roomid
     * @param roomId roomid
     */
    deleteChatroom(roomId: string): void {
        delete this.chatrooms[roomId];
    }

    /**
     * get list of roomids
     * @returns roomids
     */
    getRoomIds(): string[] {
        return _.keys(this.chatrooms);
    }

    /**
     * get chatroom from roomid
     * @param roomId roomid
     * @returns chatroom
     */
    getRoom(roomId: string): LocalChatroom {
        return this.chatrooms[roomId]
    }

    /**
     * add patiripant to Mainhall
     * @param participant identity
     */
    addParticipantDefault(participant: string): void {
        this.chatrooms[`MainHall-s${process.env.SERVER_ID}`].participants.add(participant);
    }

    /**
     * add participant to chatroom
     * @param roomId roomid
     * @param participant identity 
     */
    addParticipant(roomId: string, participant: string): void {
        this.chatrooms[roomId].participants.add(participant);
    }

    /**
     * remove a participant from chatroom
     * @param roomId roomid
     * @param participant identity
     */
    removeParticipant(roomId: string, participant: string): void {
        this.chatrooms[roomId].participants.delete(participant);
    }

    /**
     * get participant list from roomid
     * @param roomId roomid
     * @returns list of identities
     */
    getParticipants(roomId: string): string[] {
        return Array.from(this.chatrooms[roomId].participants);
    }
}