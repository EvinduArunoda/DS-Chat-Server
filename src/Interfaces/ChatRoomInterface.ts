import {Socket} from "net";

export interface ChatRoomInterface {
    [key:string] : LocalChatRoom;
}

export interface LocalChatRoom {
    owner: string;
    participants: string[];
}