import {ClientsDAO} from "../DAOs/Clients";
import {ClientService} from "../Services/clientService";

export class ServiceLocator {
    private static readonly _instances: Map<String, any> = new Map<String, any>();

    private constructor() {
    }

    static get clientsDAO(): ClientsDAO {
        const key = 'clientsDAO';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ClientsDAO());
        }
        return this._instances.get(key);
    }

    static get clientService(): ClientService {
        const key = 'clientsService';
        if (!this._instances.get(key)) {
            this._instances.set(key, new ClientService(
                this.clientsDAO
            ));
        }
        return this._instances.get(key);
    }

}