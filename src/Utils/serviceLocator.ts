import { ClientsDAO } from "../DAOs/Clients";
import { ChatroomDAO } from "../DAOs/Chatrooms";
import { ForeignChatroomsDAO } from "../DAOs/ForeignChatrooms";

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

}