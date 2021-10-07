import { Socket } from "net";
import { getMainHallId, isValidIdentity } from "../Utils/utils";
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
        const isRegistered = _.has(this.clients, identity);
        console.log("ClientsDAO.isRegistered", identity, isRegistered);
        return isRegistered;
    }

    /**
     * add new client
     * @param identity client id
     * @param sock socket
     */
    addNewClient(identity: string, sock: Socket): void {
        this.clients[identity] = { socket: sock, roomid: getMainHallId() };
        console.log("ClientsDAO.addNewClient", identity);
    }

    /**
     * remove client
     * @param sock socket
     * @returns is success
     */
    removeClient(sock: Socket): boolean {
        const identity = _.findKey(this.clients, ['socket', sock])
        if (!identity) return false;
        console.log("ClientsDAO.deleteClient", identity);
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
     * get client from socket
     * @param sock socket
     * @returns roomid
     */
    getClient(sock: Socket): LocalClient | undefined {
        const identity = _.findKey(this.clients, ['socket', sock])
        if (!identity) return;
        console.log("ClientsDAO.getClient", identity);
        return this.clients[identity];
    }

    /**
     * get client from identity
     * @param identity client id
     * @returns client
     */
    getClientFromId(identity: string): LocalClient {
        console.log("ClientsDAO.getClientFromId", identity);
        return this.clients[identity];
    }

    /**
     * get client list from list of identities
     * @param ids identities of clients
     * @returns list od clients
     */
    getClientsFromId(ids: string[]): LocalClient[] {
        console.log("ClientsDAO.getClientsFromId", ids,  _.values(_.pick(this.clients, ids)));
        return _.values(_.pick(this.clients, ids));
    }

    /**
     * join a chatroom
     * @param roomid roomid
     * @param identity identity
     */
    joinChatroom(roomid: string, identity: string): void {
        this.clients[identity].roomid = roomid;
        console.log("ClientsDAO.joinChatroom", identity);
    }

}