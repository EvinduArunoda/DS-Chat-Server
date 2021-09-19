import {Socket} from "net";

export interface ClientInterface {
    [key:string] : { Socket: Socket, isAdmin : boolean  };
}