import { Socket } from "net";
import { responseTypes } from "../Constants/responseTypes";
import { ServerList } from "../Constants/servers";
import { ServiceLocator } from "../Utils/serviceLocator";
import { getServerId, readJSONfromBuffer, writeJSONtoSocket } from "../Utils/utils";
import { LeaderService } from "./leaderService";

export class ElectionService {
    static setElectedLeader(data: any): boolean {
        const {serverid : leaderid} = data
        ServiceLocator.leaderDAO.setLeaderId(leaderid)
        console.log('leaderid', leaderid)
        return true
    }

    static async approveElection(data: any, sock: Socket): Promise<boolean> {
        const {serverid} = data
        if(serverid > getServerId()){
            writeJSONtoSocket(sock, { type: "startelection", serverid, approved: false })
            ElectionService.startElection().then(leaderId => {
                ServiceLocator.leaderDAO.setLeaderId(leaderId)
            })
            .catch(err => {
                console.log('error', err.message)
            })
        }
        return true
    }

    constructor() { }

    static async startElection(): Promise<any> {
        const T0 = 30000
        const T1 = 50000
        const T3 = 10000
        // set leaderid as emptystring
        ServiceLocator.leaderDAO.setLeaderId('')

        const higherUpServers = new ServerList().getHigherUpServers()
        console.log('Higher up', higherUpServers)

        if(higherUpServers.length < 1){
            const leaderId = getServerId()
            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
            return leaderId
        }

        higherUpServers.forEach(server => {
            const socket = new Socket()
            const { host, port } = server
            socket.connect(port, host)
            socket.setTimeout(T0);
            writeJSONtoSocket(socket, { type: "startelection", serverid: getServerId() })
            return new Promise((resolve, reject) => {
                socket.on('data', (buffer) => {
                    const data = readJSONfromBuffer(buffer);
                    console.log('election response', data)
                    // if bullied, wait T0; then restart election
                    if (data.approved === false) {
                        setTimeout(() => {
                            // check leaderid
                            if (ServiceLocator.leaderDAO.getLeaderId()) {
                                console.log(ServiceLocator.leaderDAO.getLeaderId())
                                resolve(ServiceLocator.leaderDAO.getLeaderId())
                            } else {
                                console.log('Again')
                                resolve(ElectionService.startElection())
                            }
                        }, T1)
                    }
                    socket.end();
                })

                socket.on('timeout', () => {
                    console.log('socket timeout');
                    if (ServiceLocator.leaderDAO.getLeaderId() === '') {
                        // choose itself as the leader
                        const leaderId = getServerId()
                        console.log(`Elect myself (${leaderId}) as leader due to timeout`)
                        ServiceLocator.leaderDAO.setLeaderId(leaderId.toString())
                        LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                        console.log(getServerId())
                        resolve(leaderId)
                    }else{
                        resolve(ServiceLocator.leaderDAO.getLeaderId())
                    }                    
                    socket.end();
                });

                socket.on('error', () => {
                    console.log('socket error');
                    setTimeout(() => {
                        if (ServiceLocator.leaderDAO.getLeaderId() === '') {
                            // choose itself as the leader
                            const leaderId = getServerId()
                            console.log(`Elect myself (${leaderId}) as leader due to error`)
                            ServiceLocator.leaderDAO.setLeaderId(leaderId.toString())
                            LeaderService.broadcastServers({type: "declareleader", serverid: leaderId})
                            console.log(getServerId())
                            resolve(leaderId)
                        }else{
                            resolve(ServiceLocator.leaderDAO.getLeaderId())
                        }        
                        socket.end();
                    }, T3)
                });
            })
        })
        // Ask higher id servers, wait T0
        // if get bullied, wait T1. If before the timeout, leader is not elected restart election
        // else, elect itsef as the leader and broadcast every server
        // return leaderId
    }
}