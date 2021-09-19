import {ChatRoomInterface} from "../Interfaces/ChatRoomInterface";
import {clients} from "./Clients";

export const chatRooms: ChatRoomInterface = {};

export const addNewChatRoom = (roomId: string, owner: string): void => {
    chatRooms[roomId] = {owner : owner, participants: [owner]}
}

export const addParticipant = (roomId: string, participant: string): void => {
    chatRooms[roomId].participants = [...chatRooms[roomId].participants, participant]
}

export const removeParticipant = (roomId: string, participant: string): void => {

}