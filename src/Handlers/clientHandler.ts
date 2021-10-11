import { ClientService } from "../Services/clientService";
import { Socket } from "net";

export class ClientHandler {
    newIdentity(data: any, sock: Socket): Promise<any> {
        return ClientService.registerClient(data, sock);
    }

    disconnect(sock: Socket, forced: boolean): boolean {
        return ClientService.removeClient(sock, forced);
    }
}
