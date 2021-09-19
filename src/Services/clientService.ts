import {Socket} from "net";
import {writeJSONtoSocket} from "../Utils/utils";
import {addNewClient, isRegistered, isValidIdentity, removeClient} from "../DAOs/Clients";

export class ClientService {
    constructor() {}

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;
        if (isRegistered(identity)) {
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