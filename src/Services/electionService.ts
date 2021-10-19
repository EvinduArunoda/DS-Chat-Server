import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { LeaderService } from "./leaderService";

export class ElectionService {
    static setElectedLeader(data: any): boolean {
        const {serverid} = data
        ServiceLocator.leaderDAO.setLeaderId(serverid)
        console.log('setElectedLeader', serverid)
        return true
    }

    static async approveElection(data: any, sock: Socket): Promise<boolean> {
        const {serverid} = data
        if(serverid > getServerId()){
            writeJSONtoSocket(sock, { type: "startelection", serverid, approved: false })
            ElectionService.startElection().then(() => {
            })
            .catch(err => {
                console.log('error', err.message)
            })
        }
        return true
    }

    constructor() { }

    static async startElection(): Promise<void> {
        // Ask higher id servers, wait T0
        // if get bullied, wait T1. If before the timeout, leader is not elected restart election
        // else, elect itsef as the leader and broadcast every server
        // set leaderId
        const T0 = 30000
        const T1 = 50000
        const T3 = 10000
        // set leaderid as emptystring
        ServiceLocator.leaderDAO.setLeaderId('')

        return new Promise((resolve, reject) => {
            const higherUpServers = new ServerList().getHigherUpServers()

            if(higherUpServers.length < 1){
                const leaderId = getServerId()
                ServiceLocator.leaderDAO.setLeaderId(leaderId.toString())
                LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
            }

            //hardcoded timeout
            higherUpServers.forEach(server => {
                const socket = new Socket()
                const { host, port } = server
                socket.connect(port, host)
                socket.setTimeout(T0);
                writeJSONtoSocket(socket, { type: "startelection", serverid: getServerId() })
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    console.log('election response', data)
                    // if bullied, wait T0; then restart election
                    if (data.approved === false) {
                        //this time out should be larger than socket timeout; otherwise a election is called before completing a election
                        setTimeout(() => {
                            if (ServiceLocator.leaderDAO.getLeaderId()) {
                            } else {
                                ElectionService.startElection()
                            }
                        }, 60000)
                    }
                    socket.end();
                })

                socket.on('timeout', () => {
                    setTimeout(()=>{
                        if (!ServiceLocator.leaderDAO.getLeaderId()) {
                            // choose itself as the leader
                            const leaderId = getServerId()
                            ServiceLocator.leaderDAO.setLeaderId(leaderId.toString())
                            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                        }
                        socket.end();
                    },higherUpServers.length == 1 ? 200: 10000*getServerId())

                });

                socket.on('error', () => {
                    setTimeout(() => {
                        if (ServiceLocator.leaderDAO.getLeaderId()) {
                            console.log('A leader has been selected',ServiceLocator.leaderDAO.getLeaderId())
                        } else {
                            const leaderId = getServerId()
                            ServiceLocator.leaderDAO.setLeaderId(leaderId.toString())
                            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                        }
                        socket.end();
                    }, higherUpServers.length == 1 ? 200: T1 + 2000*getServerId())
                });
            })
        })
    }
}
