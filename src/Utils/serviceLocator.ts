import { ClientsDAO } from "../DAOs/Clients";
import { ChatroomDAO } from "../DAOs/Chatrooms";
import { ForeignChatroomsDAO } from "../DAOs/ForeignChatrooms";
import { ChatroomHandler } from "../Handlers/chatroomHandler";
import { ClientHandler } from "../Handlers/clientHandler";
import { MainHandler } from "../Handlers/mainHandler";
import { ForeignClientsDAO } from "../DAOs/ForeignClients";
import { LeaderDAO } from "../DAOs/Leader";
import { ElectionHandler } from "../Handlers/electionHandler";

export class ServiceLocator {
    private static readonly _instances: Map<String, any> = new Map<String, any>();

    private constructor() { }

    static get clientsDAO(): ClientsDAO {
        const key = 'clientsDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ClientsDAO());
        }
        return this._instances.get(key);
    }

    static get chatroomDAO(): ChatroomDAO {
        const key = 'chatroomDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ChatroomDAO());
        }
        return this._instances.get(key);
    }

    static get foreignChatroomsDAO(): ForeignChatroomsDAO {
        const key = 'foreignChatroomDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ForeignChatroomsDAO());
        }
        return this._instances.get(key);
    }

    static get foreignClientsDAO(): ForeignClientsDAO {
        const key = 'foreignClientDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ForeignClientsDAO());
        }
        return this._instances.get(key);
    }

    static get leaderDAO(): LeaderDAO {
        const key = 'leaderDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new LeaderDAO());
        }
        return this._instances.get(key);
    }

    static get charoomHandler(): ChatroomHandler {
        const key = 'chatroom_handler';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ChatroomHandler());
        }
        return this._instances.get(key);
    }

    static get clientHandler(): ClientHandler {
        const key = 'client_handler';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ClientHandler());
        }
        return this._instances.get(key);
    }

    static get mainHandler(): MainHandler {
        const key = 'main_handler';
        if (!this._instances.get(key)) {
            this._instances.set(key, new MainHandler());
        }
        return this._instances.get(key);
    }

    static get electionHandler(): ElectionHandler {
        const key = 'election_handler';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ElectionHandler());
        }
        return this._instances.get(key);
    }

}