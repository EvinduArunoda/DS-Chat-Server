import { getServerId } from "../Utils/utils";

export class ServersDAO {
    private leaderid: string = getServerId();
    private leaderClock: number = 0;
    private availableServers: Set<string> = new Set<string>();

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
}
