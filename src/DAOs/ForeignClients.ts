import { ForeignClientInterface } from "../Interfaces/ForeignClientInterface";

export class ForeignClientsDAO {
    private clients: ForeignClientInterface = {}

    constructor() { }

    // called by the leader node

    /**
     * add new client
     * @param identity client id
     * @param serverid server id
     */
    addNewClient(serverid: string, identity: string): void {
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
}