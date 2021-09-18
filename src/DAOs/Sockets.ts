import {ClientSocketInterface} from "../Interfaces/clientSocketInterface";
import {Socket} from "net";

export const sockets: ClientSocketInterface = {};

export const CheckIdentityLocally = (identity: string) : boolean => {
    return Object.keys(sockets).includes(identity);
}

export const AddNewIdentity = (identity: string, sock: Socket) => {
    sockets[identity] = sock;
}