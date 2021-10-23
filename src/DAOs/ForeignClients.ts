import _ from "lodash";
import {ClientsObject, ForeignClientInterface} from "../Interfaces/ForeignClientInterface";

export class ForeignClientsDAO {
    private clients: ForeignClientInterface = {}

    constructor() { }

    // called by the leader node

    /**
     * check if the identity is unique
     * @param identity client id
     * @returns boolean
     */
    isRegistered(identity: string): boolean {
        // check if the clients Map<string, Set<string>> has identity
        var isRegistered = _.findKey(this.clients, (server) => server.has(identity)) !== undefined
        console.log("ForeignClientsDAO.isRegistered", identity, isRegistered);
        return isRegistered;
    }

    /**
     * add new client
     * @param identity client id
     * @param serverid server id
     */
    addNewClient(serverid: string, identity: string): void {
        if (this.clients[serverid] === undefined) {
            this.clients[serverid] = new Set()
        }
        this.clients[serverid].add(identity);
        console.log("ForeignClientsDAO.addNewClient", serverid, identity);
    }

    /**
     * remove client
     * @param identity client id
     * @param serverid server id
     */
    removeClient(serverid: string, identity: string): void {
        this.clients[serverid].delete(identity)
        console.log("ForeignClientsDAO.deleteClient", serverid, identity);
    }

    /**
     * get clients
     * @returns ForeignClientInterface
     */
    getClients(): ForeignClientInterface {
        const clients:any = {}
        for (const key in this.clients) {
            clients[`${key}`] = [...this.clients[key]]
        }
        return clients
    }

    /**
     * save an object of clients
     * @param clientsObject object of clients
     */
    saveClients(clientsObject: ClientsObject): void {
        for (const key in clientsObject) {
            this.clients[`${key}`] = new Set(clientsObject[key])
        }

    }
}
