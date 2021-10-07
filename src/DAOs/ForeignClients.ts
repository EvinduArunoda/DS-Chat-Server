import { ForeignClientInterface } from "../Interfaces/ForeignClientInterface";

export class ForeignClientsDAO {
    private clients: ForeignClientInterface = {}

    constructor() { }

    // called by the leader node

    /**
     * add new client
     * @param identity client id
     * @param serverId server id
     */
    addNewClient(serverID: string, identity: string): void {
        this.clients[serverID].add(identity);
        console.log("ForeignClientsDAO.addNewClient", serverID, identity);
    }

    /**
     * remove client
     * @param identity client id
     * @param serverId server id
     */
    removeClient(serverID: string, identity: string): void {
        this.clients[serverID].delete(identity)
        console.log("ForeignClientsDAO.deleteClient", serverID, identity);
    }
}