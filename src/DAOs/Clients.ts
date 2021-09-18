import {ClientInterface} from "../Interfaces/clientInterface";
import {Socket} from "net";

export const clients: ClientInterface = {};

export const isRegistered = (identity: string): boolean => {
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