import { ChatroomHandler } from "./chatroomHandler";
import { ClientHandler } from "./clientHandler";

export class MainHandler {
    constructor () {
    }

    getChatroomHandler(): ChatroomHandler {
        return new ChatroomHandler();
    }

    getClientHandler(): ClientHandler {
        return new ClientHandler();
    }
}