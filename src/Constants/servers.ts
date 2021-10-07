import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"


export class ServerList {
    private serverList: ServerInterface = {
        s1: { host: '192.168.0.1', port: '80' },
        s2: { host: '172.0.0.1', port: '80' }
    }

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[serverid];
    }

}