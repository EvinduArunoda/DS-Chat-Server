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
        console.log('approveElection', serverid, getServerId())
        if(parseInt(serverid) > parseInt(getServerId())){
            writeJSONtoSocket(sock, { type: "startelection", serverid, approved: false })
            ElectionService.startElection()
            // ServiceLocator.leaderDAO.setLeaderId(await ElectionService.startElection())
        }
        return true
    }

    constructor() { }

    static async startElection(): Promise<string> {
        console.log('START ELECTION')
        const T0 = 30000
        const T1 = 20000
        // set leaderid as emptystring
        ServiceLocator.leaderDAO.setLeaderId('')

        return new Promise((resolve, reject) => {
            const higherUpServers = new ServerList().getHigherUpServers()
            console.log('HIGH SERVERS', higherUpServers);

            if(higherUpServers.length < 1){
                const leaderId = getServerId()
                console.log('NO HIGHER SERVERS LEADER',getServerId())
                ServiceLocator.leaderDAO.setLeaderId(leaderId)
                LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                resolve(leaderId)
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
                    // if bullied, wait T0; then restart election
                    if (data.approved === false) {
                        //this time out should be larger than socket timeout; otherwise a election is called before completing a election
                        setTimeout(() => {
                            if (ServiceLocator.leaderDAO.getLeaderId()) {
                                resolve(ServiceLocator.leaderDAO.getLeaderId())
                                console.log("(timeout msg) ON DATA LEADER HAS SELECTED",ServiceLocator.leaderDAO.getLeaderId(), port)
                            } else {
                                console.log('timeout: Again election')
                                ElectionService.startElection()
                            }
                        }, 60000)
                    }
                })

                socket.on('timeout', () => {
                    console.log('socket timeOUT', host, port);
                    setTimeout(()=>{
                        if (!ServiceLocator.leaderDAO.getLeaderId()) {
                            console.log('socket timeout NO LEADER');
                            // choose itself as the leader
                            const leaderId = getServerId()
                            ServiceLocator.leaderDAO.setLeaderId(leaderId)
                            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                            resolve(leaderId)
                        }
                        socket.end();
                    },higherUpServers.length == 1 ? 200: 10000*parseInt(getServerId()))

                });

                socket.on('error', () => {
                    console.log('socket error election service', port)
                    setTimeout(() => {
                        if (ServiceLocator.leaderDAO.getLeaderId()) {
                            resolve(ServiceLocator.leaderDAO.getLeaderId())
                            console.log('A leader has been selected',ServiceLocator.leaderDAO.getLeaderId())
                        } else {
                            console.log('SOCKET ERROR no leader')
                            const leaderId = getServerId()
                            ServiceLocator.leaderDAO.setLeaderId(leaderId)
                            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                            resolve(leaderId)
                        }
                        socket.end();
                    }, higherUpServers.length == 1 ? 200: T1 + 2000*parseInt(getServerId()))
                });
            })
        })

        // TODO: Ask higher id servers, wait T0
        // if get bullied, wait T1. If before the timeout, leader is not elected restart election
        // else, elect itsef as the leader and broadcast every server
        // return leaderId
    }
}
