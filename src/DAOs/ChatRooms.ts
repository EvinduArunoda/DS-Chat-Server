import {ChatRoomInterface} from "../Interfaces/ChatRoomInterface";

export const chatRooms: ChatRoomInterface = {};

export const addNewChatRoom = (roomId: string, owner: string): void => {
    chatRooms[roomId] = {owner : owner, participants: []}
}

