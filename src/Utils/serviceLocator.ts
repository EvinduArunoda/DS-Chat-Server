import { ClientsDAO } from "../DAOs/Clients";
import { ChatroomDAO } from "../DAOs/Chatrooms";
import { ForeignChatroomsDAO } from "../DAOs/ForeignChatrooms";
import { ChatroomHandler } from "../Handlers/chatroomHandler";
import { ClientHandler } from "../Handlers/clientHandler";
import { MainHandler } from "../Handlers/mainHandler";
import { ForeignClientsDAO } from "../DAOs/ForeignClients";
import { ServersDAO } from "../DAOs/Servers";
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

    static get serversDAO(): ServersDAO {
        const key = 'serversDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ServersDAO());
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