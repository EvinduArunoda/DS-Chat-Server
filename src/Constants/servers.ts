import _ from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"
import { getServerId } from "../Utils/utils";
const config = require('config');
const servers = config("servers");

// TODO: Read from config file
export class ServerList {
    private serverList: ServerInterface = servers;

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[parseInt(serverid)];
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
