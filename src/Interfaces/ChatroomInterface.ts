export interface ChatroomInterface {
    [key:string] : LocalChatroom;
}

export interface LocalChatroom {
    owner?: string;
    participants: Set<string>;
}