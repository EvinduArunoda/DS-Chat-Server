import {Socket} from "net";
import {writeJSONtoSocket} from "../../Utils/utils";
import {AddNewClient, IsRegistered, RemoveClient} from "../../DAOs/Clients";

export class ClientService {
    constructor() {}

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;

        if (IsRegistered(identity)) {
            writeJSONtoSocket(sock, {type: "newidentity", approved: "false"});
            return false
        } else {
            // Check id in other servers
            AddNewClient(identity, sock);
            writeJSONtoSocket(sock, {type: "newidentity", approved: "true"});
            return true
        }
    }

    removeClient(sock: Socket): boolean {
        return RemoveClient(sock);
    }
}