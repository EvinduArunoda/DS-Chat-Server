import { ChatroomHandler } from "./chatroomHandler";
import { ClientHandler } from "./clientHandler";
import { CommunicationHandler } from "./communicationHandler";
import { LeaderHandler } from "./leaderHandler";

export class MainHandler {
    constructor () {
    }

    getChatroomHandler(): ChatroomHandler {
        return new ChatroomHandler();
    }

    getClientHandler(): ClientHandler {
        return new ClientHandler();
    }

    getLeaderHandler(): LeaderHandler {
        return new LeaderHandler();
    }

    getCommunicationHandler(): CommunicationHandler {
        return new CommunicationHandler();
    }
}