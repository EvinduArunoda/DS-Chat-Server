import {ClientsDAO} from "../DAOs/Clients";
import {ChatroomDAO} from "../DAOs/ChatRooms";

export class ServiceLocator {
    private static readonly _instances: Map<String, any> = new Map<String, any>();

    private constructor() {}

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

}