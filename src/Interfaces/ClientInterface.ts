import {Socket} from "net";

export interface ClientInterface {
    [key:string] : LocalClient;
}

export interface LocalClient {
    socket: Socket;
    roomId: string;
}