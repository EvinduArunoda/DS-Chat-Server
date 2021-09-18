import {ClientInterface} from "../Interfaces/clientInterface";
import {Socket} from "net";

export const clients: ClientInterface = {};

export const CheckIdentityLocally = (identity: string) : boolean => {
    return Object.keys(clients).includes(identity);
}

export const AddNewIdentity = (identity: string, sock: Socket) => {
    clients[identity] = sock;
}