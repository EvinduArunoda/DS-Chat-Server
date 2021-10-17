import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"


export class ServerList {
    private serverList: ServerInterface = {
        s1: { serverAddress: 'localhost', clientsPort: 4444, coordinationPort: 5555 },
        s2: { serverAddress: 'localhost', clientsPort: 4445, coordinationPort: 5555 }
    }

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[serverid];
    }

}