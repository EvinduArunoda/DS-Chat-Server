import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"


export class ServerList {
    private serverList: ServerInterface = {
        s1: { host: 'localhost', port: 4444 },
        s2: { host: 'localhost', port: 4445 }
    }

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[serverid];
    }

}