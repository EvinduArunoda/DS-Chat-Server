import { ServerList } from "../Constants/servers";
import { getServerId } from "../Utils/utils";

export class ServersDAO {
    private leaderid: string = getServerId();
    private leaderClock: number = 0;
    private availableServers: string[] = [];
    private deletedClients: string[] = []
    private deletedChatrooms: string[] = []

    constructor() { }

    getLeaderId(): string {
        return this.leaderid;
    }

    setLeaderId(leaderid: string) {
        console.log('SET LEADER', leaderid)
        this.leaderid = leaderid;
    }

    incrementClock() {
        this.leaderClock++
    }

    updateClock(time: number) {
        this.leaderClock = this.leaderClock > time ? this.leaderClock : time
    }

    getClock(): number {
        return this.leaderClock
    }

    updateAvailableServers(servers: string[]) {
        this.availableServers = servers
    }

    getAvailableServers() {
        return this.availableServers
    }

    hasLeaderMajority(): boolean {
        return this.availableServers.length >= new ServerList().getMajorityCount()
    }

    getDeletedClients(): string[] {
        return this.deletedClients
    }

    getDeletedChatrooms(): string[] {
        return this.deletedChatrooms
    }

    addDeletedClient(identity: string) {
        this.deletedClients = [...this.deletedClients, identity]
    }

    addDeletedChatroom(roomid: string) {
        this.deletedChatrooms = [...this.deletedChatrooms, roomid]
    }
}
