import {Socket} from "net";
import { isValidIdentity } from "../Utils/utils";
import {ClientInterface, LocalClient} from "../Interfaces/clientInterface";

// Clients DAO
export class ClientsDAO {
    private clients: ClientInterface = {};
    
    constructor() {}

    isRegistered (identity: string): boolean {
        if (!isValidIdentity) return false;
        return Object.keys(this.clients).includes(identity);
    }

    addNewClient(identity: string, sock: Socket): void {
        this.clients[identity] = {socket: sock, roomid: `MainHall-s${process.env.SERVER_ID}`};
    }

    removeClient(sock: Socket): boolean {
        const idx = Object.values(this.clients).indexOf(sock);
        if (idx == -1) return false;
        const identity = Object.keys(this.clients)[idx]
        return delete this.clients[identity];
    }

    getClient(identity: string): LocalClient {
        return this.clients[identity];
    }
}