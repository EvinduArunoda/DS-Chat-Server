import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"
import { getServerId } from "../Utils/utils";

// TODO: Read from config file
export class ServerList {
    private serverList: ServerInterface = {
        1: { serverAddress: 'localhost', clientsPort: 4444, coordinationPort: 5555 },
        2: { serverAddress: 'localhost', clientsPort: 4445, coordinationPort: 5555 }
    }

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[serverid];
    }

    getHigherUpServers(): Server[]{
        const higherUpServers = []
        for (let key in this.serverList){
            if(parseInt(key) < parseInt(getServerId())){
                higherUpServers.push(this.serverList[key])
            }
        }
        return higherUpServers
    }

}