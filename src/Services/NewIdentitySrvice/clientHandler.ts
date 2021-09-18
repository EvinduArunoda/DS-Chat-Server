import {ClientService} from "./clientService";
import {Socket} from "net";

export class ClientHandler {
    newIdentity (data: any, sock: Socket) {
        const service = new ClientService();
        service.handleNewIdentity(data, sock);
    }
}