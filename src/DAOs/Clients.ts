import {ClientInterface} from "../Interfaces/ClientInterface";
import {Socket} from "net";

export const clients: ClientInterface = {};

export const isRegistered = (identity: string): boolean => {
    if (!isValidIdentity) return false;
    return Object.keys(clients).includes(identity);
}

export function isValidIdentity(identity: string): boolean {
    // check if identity is alphanumeric string starting with an upper or lower case character. 
    // It must be at least 3 characters and no more than 16 characters long.
    return /^[A-Za-z]{1}[A-Za-z0-9]{2,15}$/.test(identity)
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
