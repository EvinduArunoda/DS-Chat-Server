import {Socket} from "net";

export interface ClientSocketInterface {
    [key:string] : Socket;
}