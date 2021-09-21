import {ChatRoomInterface} from "../Interfaces/ChatRoomInterface";

export class ChatroomDAO {
    private chatRooms: ChatRoomInterface = { "mainHall" : { owner: undefined, participants :[]}};

    constructor() {}

    addNewChatRoom(roomId: string, owner: string): void {
        this.chatRooms[roomId] = {owner : owner, participants: [owner]}
    }

    addParticipant(roomId: string, participant: string): void {
        this.chatRooms[roomId].participants = [...this.chatRooms[roomId].participants, participant]
    }

    removeParticipant(roomId: string, participant: string): void {

    }
}