import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { LeaderService } from "./leaderService";

export class ElectionService {
    static setElectedLeader(data: any): boolean {
        const { serverid: leaderid } = data
        ServiceLocator.serversDAO.setLeaderId(leaderid)
        console.log('leaderid', leaderid)
        return true
    }

    static async approveElection(data: any, sock: Socket): Promise<boolean> {
        const { serverid } = data
        if (serverid > getServerId()) {
            writeJSONtoSocket(sock, { type: responseTypes.START_ELECTION, serverid, approved: false })
            ElectionService.startElection().then(() => {
            })
                .catch(err => {
                    console.log('error', err.message)
                })
        }
        return true
    }

    constructor() { }

    static async startElection(reelection?:boolean): Promise<void> {
        // Ask higher id servers, wait T0
        // if get bullied, wait T1. If before the timeout, leader is not elected restart election
        // else, elect itsef as the leader and broadcast every server
        // set leaderid
        console.log('STARTING ELECTION / RE ELECTION -', reelection);
        //********* new method
        //ask higher ids
        //wait for all responses
        //after responses wait some more,  after the timeout, if leader is not elected restart election
        //if no responses elect it self as leader

        const T0 = 30000
        const T1 = 50000
        const T3 = 10000
        // set leaderid as emptystring
        // ServiceLocator.serversDAO.setLeaderId('')

        const higherUpServers = new ServerList().getHigherUpServers()
        const promisesList: Array<Promise<any>> = [];

        if (higherUpServers.length < 1) {
            const leaderid = getServerId()
            ServiceLocator.serversDAO.setLeaderId(leaderid)
            LeaderService.broadcastServers({ type: responseTypes.DECLARE_LEADER, serverid: leaderid })
        }

        higherUpServers.forEach(server => {
            const socket = new Socket()
            const { serverAddress: host, coordinationPort: port } = server
            socket.connect(port, host)
            socket.setTimeout(T0);
            writeJSONtoSocket(socket, { type: responseTypes.START_ELECTION, serverid: getServerId() })
            const promise = new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    // if bullied, wait T0; then restart election
                    if (data.approved === false) {
                        resolve(false);
                    }
                    socket.end();
                })

                socket.on('timeout', () => {
                    resolve("");
                    socket.end();
                });

                socket.on('error', () => {
                    resolve("");
                    socket.end();
                });
            });

            promisesList.push(promise);
        });

        if(promisesList.length > 0){
            Promise.all(promisesList).then(values => {
                console.log('ELECTION RESULTS (with socket timeouts)', values)
                let uniq = [...new Set(values)];
                if(uniq.includes(false)){
                    //  set timeout; wait for leader id; if not re elect
                    //  timeout can be set a lower value than T1 + ...
                    setTimeout(() => {
                        if (ServiceLocator.serversDAO.getLeaderId()) {
                            console.log('A leader has been selected', ServiceLocator.serversDAO.getLeaderId())
                        } else {
                            //re election
                            this.startElection(true)
                        }
                    }, higherUpServers.length == 1 ? 200 : 1000 * parseInt(getServerId()))
                }else{
                    //    set this server as leader n broadcast
                    const leaderid = getServerId();
                    ServiceLocator.serversDAO.setLeaderId(leaderid);
                    LeaderService.broadcastServers({ type: responseTypes.DECLARE_LEADER, serverid: leaderid });
                }
            })
        }
    }
}
