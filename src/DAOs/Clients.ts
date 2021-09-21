import { Socket } from "net";
import { isValidIdentity } from "../Utils/utils";
import { ClientInterface, LocalClient } from "../Interfaces/ClientInterface";
import _ from "lodash";

// Clients DAO
export class ClientsDAO {
    private clients: ClientInterface = {};

    constructor() { }

    isRegistered(identity: string): boolean {
        if (!isValidIdentity) return false;
        return _.has(this.clients, identity);
    }

    addNewClient(identity: string, sock: Socket): void {
        this.clients[identity] = { socket: sock, roomId: `MainHall-s${process.env.SERVER_ID}` };
    }

    removeClient(sock: Socket): boolean {
        const identity = _.findKey(this.clients, ['socket', sock])
        if (!identity) return false;
        return delete this.clients[identity];
    }

    getClient(identity: string): LocalClient {
        return this.clients[identity];
    }

    getClientsFromId(ids: string[]): LocalClient[] {
        return _.values(_.pick(this.clients, ids));
    }
}