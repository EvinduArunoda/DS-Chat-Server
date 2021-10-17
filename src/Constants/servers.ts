import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"
import { getServerId } from "../Utils/utils";

// TODO: Read from config file
export class ServerList {
    private serverList: ServerInterface = {
        1: { host: 'localhost', port: 4444 },
        2: { host: 'localhost', port: 4445 },
        3: { host: 'localhost', port: 4446 }
    }

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[parseInt(serverid)];
    }

    getHigherUpServers(): Server[]{
        const higherUpServers = []
        for (let key in this.serverList){
            if(parseInt(key) < getServerId()){
                higherUpServers.push(this.serverList[key])
            }
        }
        return higherUpServers
    }

}