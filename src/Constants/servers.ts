import _, { indexOf } from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"
import { getServerId } from "../Utils/utils";
const fs = require('fs');

const data = fs.readFileSync('config.txt', 'utf8').toString().split('\n').map((el: string) => el.split(/\s*[\s,]\s*/));

interface ServersInterface {
    [key:number] : {
        "serverAddress": string, "clientsPort": number, "coordinationPort": number
    };
}

let servers : ServersInterface = {}

data.forEach((element: any) => {
    servers[indexOf(data,element)+1] = {
        "serverAddress": element[1], "clientsPort": parseInt(element[2],10), "coordinationPort": parseInt(element[3],10)
    }
});


export class ServerList {
    private serverList: ServerInterface = servers;

    getServerIds(): string[] {
        return _.keys(this.serverList)
    }

    getServer(serverid: string): Server {
        return this.serverList[parseInt(serverid)];
    }

    getHigherUpServers(): Server[] {
        const higherUpServers = []
        for (let key in this.serverList){
            if(parseInt(key) < parseInt(getServerId())){
                higherUpServers.push(this.serverList[key])
            }
        }
        return higherUpServers
    }

}
