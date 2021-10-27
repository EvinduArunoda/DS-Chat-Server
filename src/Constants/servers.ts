import _, { indexOf } from "lodash";
import { Server, ServerInterface } from "../Interfaces/ServerInterface"
import { getServerIdNumber } from "../Utils/utils";
const fs = require('fs');

const data = fs.readFileSync('config.txt', 'utf8').toString().trim().split('\n').map((el: string) => el.split(/\s*[\s,]\s*/));

let servers : ServerInterface = {}

data.forEach((element: any) => {
    servers[indexOf(data,element)+1] = new Server(indexOf(data,element)+1, element[1], parseInt(element[2],10), parseInt(element[3],10))
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
        for (let key in this.serverList) {
            if (parseInt(key) > getServerIdNumber()) {
                higherUpServers.push(this.serverList[key])
            }
        }
        return higherUpServers
    }

    getMajorityCount(): number {
        const serverCount = _.keys(this.serverList).length
        return Math.floor(serverCount / 2) + 1
    }

}
