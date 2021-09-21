import {ChatroomInterface} from "../Interfaces/ChatroomInterface";

export class ChatroomDAO {
    private chatrooms: ChatroomInterface = {};

    constructor() {
        this.chatrooms[`MainHall-s${process.env.SERVER_ID}`] = {
            owner: undefined,
            participants : new Set<string>(),
            default: true
        };
    }

    addNewChatroom(roomId: string, owner: string): void {
        this.chatrooms[roomId] = {
            owner : owner, 
            participants: new Set<string>(owner), 
            default: false
        };
    }

    deleteChatroom(roomId: string){
        delete this.chatrooms[roomId];
    }

    addParticipantDefault(participant: string): void {
        this.chatrooms[`MainHall-s${process.env.SERVER_ID}`].participants.add(participant);
    }

    addParticipant(roomId: string, participant: string): void {
        this.chatrooms[roomId].participants.add(participant);
    }

    removeParticipant(roomId: string, participant: string): void {
        this.chatrooms[roomId].participants.delete(participant);
    }

    getParticipants(roomId: string): Set<string> {
        return this.chatrooms[roomId].participants;
    }
}