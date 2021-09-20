import {Socket} from "net";
import { isValidIdentity } from "../Utils/utils";
import {ClientInterface} from "../Interfaces/clientInterface";

export const clients: ClientInterface = {};

export const isRegistered = (identity: string): boolean => {
    if (!isValidIdentity) return false;
    return Object.keys(clients).includes(identity);
}

export const addNewClient = (identity: string, sock: Socket): void => {
    clients[identity] = sock;
}

export const removeClient = (sock: Socket): boolean => {
    const idx = Object.values(clients).indexOf(sock);
    if (idx == -1) return false;
    const identity = Object.keys(clients)[idx]
    return delete clients[identity];
}

// Clients DAO
export class ClientsDAO {
    constructor(
    ) {
    }

    isRegistered (identity: string): boolean {
        if (!isValidIdentity) return false;
        return Object.keys(clients).includes(identity);
    }

    addNewClient(identity: string, sock: Socket): void {
        clients[identity] = sock;
    }

    removeClient(sock: Socket): boolean {
        const idx = Object.values(clients).indexOf(sock);
        if (idx == -1) return false;
        const identity = Object.keys(clients)[idx]
        return delete clients[identity];
    }
}