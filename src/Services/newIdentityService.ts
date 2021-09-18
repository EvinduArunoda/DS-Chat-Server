import {Socket} from "net";
import {writeJSONtoSocket} from "../utils";
import {AddNewIdentity, CheckIdentityLocally} from "../DAOs/Sockets";

export class NewIdentityService {
    constructor() {}

   handleNewIdentity(data: any, sock: Socket){
        const identity = data.identity;

        if (CheckIdentityLocally(identity)) {
            writeJSONtoSocket(sock, {type: "newidentity", approved: "false"});
        } else {
            // Check id in other servers
            AddNewIdentity(identity, sock);
            writeJSONtoSocket(sock, {type: "newidentity", approved: "true"});
        }
        console.log("reply sent")
    }


}