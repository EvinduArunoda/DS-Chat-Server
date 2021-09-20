import {ClientService} from "../Services/clientService";
import {Socket} from "net";
import {ServiceLocator} from "../Utils/serviceLocator";

export class ClientHandler {
    newIdentity (data: any, sock: Socket): boolean {
        const service = new ClientService();
        return service.registerClient(data, sock);
    }

    disconnect (sock: Socket): boolean {
        const service = new ClientService();
        return service.removeClient(sock);
    }
}