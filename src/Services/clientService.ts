import {Socket} from "net";
import {writeJSONtoSocket} from "../Utils/utils";
import { ServiceLocator } from "../Utils/serviceLocator";

export class ClientService {
    constructor() {}

    registerClient(data: any, sock: Socket): boolean {
        const identity = data.identity;
        if (ServiceLocator.clientsDAO.isRegistered(identity)) {
            writeJSONtoSocket(sock, {type: "newidentity", approved: "false"});
            return false
        } else {
            // Check id in other servers
            ServiceLocator.clientsDAO.addNewClient(identity, sock);
            writeJSONtoSocket(sock, {type: "newidentity", approved: "true"});
            return true
        }
    }

    removeClient(sock: Socket): boolean {
        return ServiceLocator.clientsDAO.removeClient(sock);
    }
}