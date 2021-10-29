import { ServerList } from "../Constants/servers";
import { getServerId } from "../Utils/utils";

export class ServersDAO {
    private leaderid: string = getServerId();
    private leaderClock: number = 0;
    private availableServers: string[] = [];
    private deletedClients: string[] = [];
    private deletedChatrooms: string[] = [];
    private restarted: boolean = true;

    constructor() { }

    getLeaderId(): string {
        return this.leaderid;
    }

    getRestarted(): boolean {
        const value = this.restarted;
        this.restarted = false;
        return value;
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
        this.availableServers = [...servers, getServerId()]
    }

    getAvailableServers() {
        return this.availableServers
    }

    hasLeaderMajority(): boolean {
        return this.availableServers.length >= new ServerList().getMajorityCount()
    }

    getDeletedClients(): string[] {
        const values = this.deletedClients;
        this.deletedClients = [];
        return values;
    }

    getDeletedChatrooms(): string[] {
        const values = this.deletedChatrooms;
        this.deletedChatrooms = [];
        return values;
    }

    addDeletedClient(identity: string) {
        this.deletedClients = [...this.deletedClients, identity]
    }

    addDeletedChatroom(roomid: string) {
        this.deletedChatrooms = [...this.deletedChatrooms, roomid]
    }
}
