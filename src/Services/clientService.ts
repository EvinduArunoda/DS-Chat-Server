import {Socket} from "net";
import {writeJSONtoSocket} from "../Utils/utils";
import {ClientsDAO} from "../DAOs/Clients";

export class ClientService {
    constructor(
        protected clientsDAO: ClientsDAO
    ) {}

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;
        if (this.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, {type: "newidentity", approved: "false"});
            return false
        } else {
            // Check id in other servers
            this.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, {type: "newidentity", approved: "true"});
            return true
        }
    }

    removeClient(sock: Socket): boolean {
        return this.clientsDAO.removeClient(sock);
    }
}