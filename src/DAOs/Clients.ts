import { Socket } from "net";
import { isValidIdentity } from "../Utils/utils";
import { ClientInterface, LocalClient } from "../Interfaces/ClientInterface";
import _ from "lodash";

// Clients DAO
export class ClientsDAO {
    private clients: ClientInterface = {};

    constructor() { }

    /**
     * check if the identity is unique
     * @param identity client id
     * @returns boolean
     */
    isRegistered(identity: string): boolean {
        if (!isValidIdentity) return false;
        return _.has(this.clients, identity);
    }

    /**
     * add new client
     * @param identity client id
     * @param sock socket
     */
    addNewClient(identity: string, sock: Socket): void {
        this.clients[identity] = { socket: sock, roomId: `MainHall-s${process.env.SERVER_ID}` };
    }

    /**
     * remove client
     * @param sock socket
     * @returns is success
     */
    removeClient(sock: Socket): boolean {
        const identity = _.findKey(this.clients, ['socket', sock])
        if (!identity) return false;
        return delete this.clients[identity];
    }

    /**
     * get client identity from socket
     * @param sock 
     * @returns identity
     */
    getIdentity(sock: Socket): string | undefined {
        return _.findKey(this.clients, ['socket', sock])
    }

    /**
     * get roomid from socket
     * @param sock socket
     * @returns roomid
     */
    getRoomId(sock: Socket): string | undefined {
        const identity = _.findKey(this.clients, ['socket', sock])
        if (!identity) return;
        return this.clients[identity].roomId;
    }

    /**
     * get client from identity
     * @param identity client id
     * @returns client
     */
    getClientFromId(identity: string): LocalClient {
        return this.clients[identity];
    }

    /**
     * get client list from list of identities
     * @param ids identities of clients
     * @returns list od clients
     */
    getClientsFromId(ids: string[]): LocalClient[] {
        return _.values(_.pick(this.clients, ids));
    }
}