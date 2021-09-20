import {ClientService} from "../Services/clientService";
import {Socket} from "net";
import {ServiceLocator} from "../Utils/serviceLocator";

export class ClientHandler {
    newIdentity (data: any, sock: Socket): boolean {
        const service = ServiceLocator.clientService;
        return service.registerClient(data, sock);
    }

    disconnect (sock: Socket): boolean {
        const service = ServiceLocator.clientService;
        return service.removeClient(sock);
    }
}