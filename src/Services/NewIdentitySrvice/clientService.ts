import {Socket} from "net";
import {writeJSONtoSocket} from "../../Utils/utils";
import {AddNewIdentity, CheckIdentityLocally} from "../../DAOs/Clients";

export class ClientService {
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