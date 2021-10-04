import { ClientService } from "../Services/clientService";
import { Socket } from "net";

export class ClientHandler {
    static newIdentity(data: any, sock: Socket): boolean {
        return ClientService.registerClient(data, sock);
    }

    static disconnect(sock: Socket, forced: boolean): boolean {
        return ClientService.removeClient(sock, forced);
    }
}