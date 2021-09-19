import {Socket} from "net";
import {writeJSONtoSocket, isValidIdentity} from "../Utils/utils";
import {addNewClient, isRegistered, removeClient} from "../DAOs/Clients";

export class ClientService {
    constructor() {}

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;
        if (!isValidIdentity(identity) || isRegistered(identity)) {
            writeJSONtoSocket(sock, {type: "newidentity", approved: "false"});
            return false
        } else {
            // Check id in other servers
            addNewClient(identity, sock);
            writeJSONtoSocket(sock, {type: "newidentity", approved: "true"});
            return true
        }
    }

    removeClient(sock: Socket): boolean {
        return removeClient(sock);
    }
}